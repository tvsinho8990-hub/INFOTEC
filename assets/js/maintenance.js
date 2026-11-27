(() => {
    const MAINTENANCE_STATUS = Object.freeze({
        EM_ESPERA: 'Em espera',
        EM_MANUTENCAO: 'Em manutenção',
        CONCLUIDO: 'Concluído'
    });

    const PATRIMONIO_STATUS = Object.freeze({
        DISPONIVEL: 'Disponível',
        CAUTELADO: 'Cautelado',
        MANUTENCAO: 'Manutenção'
    });

    const VALID_MAINTENANCE_STATUSES = Object.freeze([
        MAINTENANCE_STATUS.EM_ESPERA,
        MAINTENANCE_STATUS.EM_MANUTENCAO,
        MAINTENANCE_STATUS.CONCLUIDO
    ]);

    const VALID_PATRIMONIO_STATUSES = Object.freeze([
        PATRIMONIO_STATUS.DISPONIVEL,
        PATRIMONIO_STATUS.CAUTELADO,
        PATRIMONIO_STATUS.MANUTENCAO
    ]);

    const VALID_PREVIOUS_STATUSES = Object.freeze([
        PATRIMONIO_STATUS.DISPONIVEL,
        PATRIMONIO_STATUS.CAUTELADO
    ]);

    function getTodayISO() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateBR(dateValue) {
        if (!dateValue) return '—';

        const isoDateOnly = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoDateOnly) {
            return `${isoDateOnly[3]}/${isoDateOnly[2]}/${isoDateOnly[1]}`;
        }

        const parsed = new Date(dateValue);
        if (Number.isNaN(parsed.getTime())) {
            return String(dateValue);
        }

        return parsed.toLocaleDateString('pt-BR');
    }

    function getStatusBadgeClass(status) {
        const map = {
            [MAINTENANCE_STATUS.EM_ESPERA]: 'maint-waiting',
            [MAINTENANCE_STATUS.EM_MANUTENCAO]: 'maint-progress',
            [MAINTENANCE_STATUS.CONCLUIDO]: 'maint-done'
        };
        return map[status] || 'maint-waiting';
    }

    function generateMaintenanceId(manutencoes) {
        const maxNum = (manutencoes || []).reduce((max, item) => {
            const match = String(item?.id || '').match(/^MNT-(\d+)$/);
            if (!match) return max;
            const parsed = Number.parseInt(match[1], 10);
            return Number.isFinite(parsed) && parsed > max ? parsed : max;
        }, 0);

        return `MNT-${String(maxNum + 1).padStart(4, '0')}`;
    }

    function inferPreviousStatus(patrimonio) {
        if (!patrimonio) return PATRIMONIO_STATUS.DISPONIVEL;
        const hasResponsavel = Boolean(patrimonio.responsavel && patrimonio.responsavel !== '—');
        return hasResponsavel ? PATRIMONIO_STATUS.CAUTELADO : PATRIMONIO_STATUS.DISPONIVEL;
    }

    function findUsuarioDepartamento(state, nomeResponsavel) {
        if (!nomeResponsavel || nomeResponsavel === '—') return 'Não vinculado';
        const usuario = Array.isArray(state?.usuarios)
            ? state.usuarios.find((u) => u.nome === nomeResponsavel)
            : null;
        return usuario?.departamento || 'Não vinculado';
    }

    /**
     * Migra e reconcilia estados salvos no localStorage antes do módulo de manutenção.
     */
    function ensureMaintenanceSchema(state, defaultMaintenances = []) {
        if (!state || typeof state !== 'object') return state;

        const patrimonios = Array.isArray(state.patrimonios) ? state.patrimonios : [];
        const patrimonioMap = new Map(patrimonios.map((item) => [item.codigo, item]));

        if (!Array.isArray(state.manutencoes)) {
            state.manutencoes = JSON.parse(JSON.stringify(defaultMaintenances)).filter((item) => {
                const pat = patrimonioMap.get(item.patrimonioCodigo);
                return pat && pat.status === PATRIMONIO_STATUS.MANUTENCAO;
            });
        }

        patrimonios.forEach((patrimonio) => {
            if (patrimonio.status !== PATRIMONIO_STATUS.MANUTENCAO) return;

            const hasOpen = state.manutencoes.some(
                (item) => item.patrimonioCodigo === patrimonio.codigo && item.status !== MAINTENANCE_STATUS.CONCLUIDO
            );

            if (!hasOpen) {
                state.manutencoes.push({
                    id: generateMaintenanceId(state.manutencoes),
                    patrimonioCodigo: patrimonio.codigo,
                    patrimonioNome: patrimonio.descricao || 'Equipamento',
                    patrimonioCategoria: patrimonio.categoria || '—',
                    patrimonioResponsavel: patrimonio.responsavel || '—',
                    patrimonioDepartamento: findUsuarioDepartamento(state, patrimonio.responsavel),
                    patrimonioConservacao: patrimonio.conservacao || '—',
                    statusAnterior: inferPreviousStatus(patrimonio),
                    problema: 'Registro migrado automaticamente: equipamento encontrava-se em manutenção.',
                    status: MAINTENANCE_STATUS.EM_ESPERA,
                    dataAbertura: patrimonio.dataCadastro || getTodayISO(),
                    dataConclusao: null
                });
            }
        });

        return state;
    }

    function getOpenMaintenanceByAsset(state, codigoPatrimonio) {
        if (!state || !Array.isArray(state.manutencoes)) return null;
        return (
            state.manutencoes.find(
                (item) => item.patrimonioCodigo === codigoPatrimonio && item.status !== MAINTENANCE_STATUS.CONCLUIDO
            ) || null
        );
    }

    function getMaintenanceById(state, manutencaoId) {
        if (!state || !Array.isArray(state.manutencoes)) return null;
        return state.manutencoes.find((item) => item.id === manutencaoId) || null;
    }

    /**
     * Executa operações de alteração com snapshot e rollback em memória se houver erro.
     */
    function executeAtomicTransaction(context, operationFn) {
        const snapshot = JSON.stringify(context.getState());

        try {
            const workingState = JSON.parse(snapshot);
            const result = operationFn(workingState);

            context.setState(workingState);
            context.persistState(workingState);

            return { ok: true, data: result };
        } catch (error) {
            try {
                const restoredState = JSON.parse(snapshot);
                context.setState(restoredState);
            } catch (rollbackError) {
                console.error('Erro ao restaurar snapshot em memória:', rollbackError);
            }

            return {
                ok: false,
                error: error?.message || 'Não foi possível concluir a operação.'
            };
        }
    }

    function editarPatrimonio(context, payload) {
        const {
            codigoOriginal,
            codigo,
            descricao,
            categoria,
            responsavel,
            conservacao,
            dataCadastro,
            status
        } = payload || {};

        return executeAtomicTransaction(context, (state) => {
            if (!Array.isArray(state.patrimonios)) {
                throw new Error('Base de patrimônios indisponível.');
            }

            const patrimonio = state.patrimonios.find((item) => item.codigo === codigoOriginal);
            if (!patrimonio) {
                throw new Error('Patrimônio não encontrado para edição.');
            }

            const novoCodigo = String(codigo || '').trim();
            const novaDescricao = String(descricao || '').trim();
            const novaCategoria = String(categoria || '').trim();
            const novoResponsavel = String(responsavel || '—').trim() || '—';
            const novaConservacao = String(conservacao || patrimonio.conservacao || 'Bom').trim();
            const novaData = String(dataCadastro || patrimonio.dataCadastro || getTodayISO()).trim();
            const novoStatus = String(status || patrimonio.status).trim();

            if (!novoCodigo || !novaDescricao || !novaCategoria) {
                throw new Error('Número de tombo, descrição e categoria são obrigatórios.');
            }

            if (!VALID_PATRIMONIO_STATUSES.includes(novoStatus)) {
                throw new Error('Status de patrimônio inválido.');
            }

            const duplicado = state.patrimonios.find(
                (item) =>
                    item.codigo !== codigoOriginal &&
                    item.codigo.trim().toLowerCase() === novoCodigo.toLowerCase()
            );
            if (duplicado) {
                throw new Error(`Já existe outro patrimônio cadastrado com o tombo ${novoCodigo}.`);
            }

            const openMaint = getOpenMaintenanceByAsset(state, codigoOriginal);
            if (openMaint && novoStatus !== PATRIMONIO_STATUS.MANUTENCAO) {
                throw new Error(
                    `Não é possível alterar manualmente o status enquanto a manutenção ${openMaint.id} estiver em aberto. Conclua a manutenção para restaurar o status anterior.`
                );
            }

            if (!openMaint && novoStatus === PATRIMONIO_STATUS.MANUTENCAO && patrimonio.status !== PATRIMONIO_STATUS.MANUTENCAO) {
                throw new Error(
                    'Para colocar um patrimônio em manutenção, utilize a ação "Manutenção" para registrar o problema e preservar o status anterior.'
                );
            }

            patrimonio.codigo = novoCodigo;
            patrimonio.descricao = novaDescricao;
            patrimonio.categoria = novaCategoria;
            patrimonio.responsavel = novoResponsavel;
            patrimonio.departamento = findUsuarioDepartamento(state, novoResponsavel);
            patrimonio.conservacao = novaConservacao;
            patrimonio.dataCadastro = novaData;
            patrimonio.status = novoStatus;

            // Preserva relacionamentos em manutenções, movimentações e clientes caso o tombo ou dados mudem
            if (Array.isArray(state.manutencoes)) {
                state.manutencoes.forEach((mnt) => {
                    if (mnt.patrimonioCodigo === codigoOriginal) {
                        mnt.patrimonioCodigo = novoCodigo;
                        if (mnt.status !== MAINTENANCE_STATUS.CONCLUIDO) {
                            mnt.patrimonioNome = novaDescricao;
                            mnt.patrimonioCategoria = novaCategoria;
                            mnt.patrimonioResponsavel = novoResponsavel;
                            mnt.patrimonioDepartamento = patrimonio.departamento;
                            mnt.patrimonioConservacao = novaConservacao;
                        }
                    }
                });
            }

            if (codigoOriginal !== novoCodigo) {
                if (Array.isArray(state.movimentacoes)) {
                    state.movimentacoes.forEach((mov) => {
                        if (mov.patrimonio === codigoOriginal) {
                            mov.patrimonio = novoCodigo;
                        }
                    });
                }

                if (Array.isArray(state.clientes)) {
                    state.clientes.forEach((cli) => {
                        if (Array.isArray(cli.patrimonios)) {
                            cli.patrimonios = cli.patrimonios.map((cod) =>
                                cod === codigoOriginal ? novoCodigo : cod
                            );
                        }
                    });
                }
            }

            return patrimonio;
        });
    }

    function abrirManutencao(context, payload) {
        const { codigoPatrimonio, problema, dataAbertura } = payload || {};

        return executeAtomicTransaction(context, (state) => {
            if (!Array.isArray(state.patrimonios)) {
                throw new Error('Base de patrimônios indisponível.');
            }
            if (!Array.isArray(state.manutencoes)) {
                state.manutencoes = [];
            }

            const patrimonio = state.patrimonios.find((item) => item.codigo === codigoPatrimonio);
            if (!patrimonio) {
                throw new Error('Patrimônio não encontrado.');
            }

            if (patrimonio.status === PATRIMONIO_STATUS.MANUTENCAO) {
                throw new Error('Este equipamento já está em manutenção e não pode ser encaminhado novamente.');
            }

            const openMaintenance = getOpenMaintenanceByAsset(state, codigoPatrimonio);
            if (openMaintenance) {
                throw new Error('Este patrimônio já possui uma solicitação de manutenção aberta.');
            }

            if (!VALID_PREVIOUS_STATUSES.includes(patrimonio.status)) {
                throw new Error(`Status atual inválido para encaminhamento: ${patrimonio.status}.`);
            }

            const problemaLimpo = String(problema || '').trim();
            if (!problemaLimpo) {
                throw new Error('Descreva o problema apresentado pelo equipamento.');
            }

            const dataValida = String(dataAbertura || '').trim() || getTodayISO();
            const statusAnterior = patrimonio.status;

            const novaSolicitacao = {
                id: generateMaintenanceId(state.manutencoes),
                patrimonioId: patrimonio.id ?? null,
                patrimonioCodigo: patrimonio.codigo,
                patrimonioNome: patrimonio.descricao,
                patrimonioCategoria: patrimonio.categoria,
                patrimonioResponsavel: patrimonio.responsavel || '—',
                patrimonioDepartamento: patrimonio.departamento || findUsuarioDepartamento(state, patrimonio.responsavel),
                patrimonioConservacao: patrimonio.conservacao || '—',
                statusAnterior,
                problema: problemaLimpo,
                status: MAINTENANCE_STATUS.EM_ESPERA,
                dataAbertura: dataValida,
                dataConclusao: null
            };

            patrimonio.status = PATRIMONIO_STATUS.MANUTENCAO;
            state.manutencoes.unshift(novaSolicitacao);

            if (Array.isArray(state.movimentacoes)) {
                state.movimentacoes.unshift({
                    data: formatDateBR(dataValida),
                    patrimonio: patrimonio.codigo,
                    acao: 'Manutenção',
                    responsavel: patrimonio.responsavel || '—',
                    registradoPor: state.currentUser?.nome || 'Administrador'
                });
            }

            return novaSolicitacao;
        });
    }

    function atualizarStatusManutencao(context, payload) {
        const { manutencaoId, novoStatus } = payload || {};

        return executeAtomicTransaction(context, (state) => {
            if (!VALID_MAINTENANCE_STATUSES.includes(novoStatus)) {
                throw new Error('Status de manutenção inválido.');
            }

            const manutencao = getMaintenanceById(state, manutencaoId);
            if (!manutencao) {
                throw new Error('Solicitação de manutenção não encontrada.');
            }

            if (manutencao.status === MAINTENANCE_STATUS.CONCLUIDO) {
                throw new Error('Esta solicitação já foi concluída e não pode mais ser alterada.');
            }

            const patrimonio = Array.isArray(state.patrimonios)
                ? state.patrimonios.find((item) => item.codigo === manutencao.patrimonioCodigo)
                : null;

            if (!patrimonio) {
                throw new Error('Patrimônio associado à manutenção não foi encontrado.');
            }

            if (novoStatus === MAINTENANCE_STATUS.CONCLUIDO) {
                if (!VALID_PREVIOUS_STATUSES.includes(manutencao.statusAnterior)) {
                    throw new Error('Status anterior do patrimônio inválido para restauração.');
                }

                const dataConclusao = getTodayISO();
                patrimonio.status = manutencao.statusAnterior;
                manutencao.status = MAINTENANCE_STATUS.CONCLUIDO;
                manutencao.dataConclusao = dataConclusao;

                if (Array.isArray(state.movimentacoes)) {
                    state.movimentacoes.unshift({
                        data: formatDateBR(dataConclusao),
                        patrimonio: patrimonio.codigo,
                        acao: 'Retorno de manutenção',
                        responsavel: patrimonio.responsavel || '—',
                        registradoPor: state.currentUser?.nome || 'Administrador'
                    });
                }

                return manutencao;
            }

            manutencao.status = novoStatus;
            patrimonio.status = PATRIMONIO_STATUS.MANUTENCAO;

            return manutencao;
        });
    }

    function concluirManutencao(context, manutencaoId) {
        return atualizarStatusManutencao(context, {
            manutencaoId,
            novoStatus: MAINTENANCE_STATUS.CONCLUIDO
        });
    }

    const api = {
        MAINTENANCE_STATUS,
        PATRIMONIO_STATUS,
        VALID_MAINTENANCE_STATUSES,
        VALID_PATRIMONIO_STATUSES,
        VALID_PREVIOUS_STATUSES,
        getTodayISO,
        formatDateBR,
        getStatusBadgeClass,
        findUsuarioDepartamento,
        ensureMaintenanceSchema,
        getOpenMaintenanceByAsset,
        getMaintenanceById,
        executeAtomicTransaction,
        editarPatrimonio,
        abrirManutencao,
        atualizarStatusManutencao,
        concluirManutencao
    };

    if (typeof window !== 'undefined') {
        window.StockFlowMaintenance = api;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
