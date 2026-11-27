(() => {
    const STORAGE_KEY = 'stockflowAppState';

    const defaultState = {
        patrimonios: [
            {
                codigo: 'PT-0001',
                descricao: 'Notebook Dell Latitude',
                categoria: 'Informática',
                responsavel: 'João Silva',
                status: 'Cautelado',
                dataCadastro: '2026-09-01',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0002',
                descricao: 'Monitor 24"',
                categoria: 'Informática',
                responsavel: '—',
                status: 'Disponível',
                dataCadastro: '2026-09-03',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0003',
                descricao: 'Impressora HP',
                categoria: 'Equipamentos',
                responsavel: 'Carla Souza',
                status: 'Cautelado',
                dataCadastro: '2026-09-04',
                conservacao: 'Regular'
            },
            {
                codigo: 'PT-0004',
                descricao: 'Computador Desktop',
                categoria: 'Informática',
                responsavel: 'Carla Souza',
                status: 'Manutenção',
                dataCadastro: '2026-09-05',
                conservacao: 'Necessita manutenção'
            },
            {
                codigo: 'PT-0108',
                descricao: 'Notebook Lenovo ThinkPad',
                categoria: 'Informática',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-12',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0114',
                descricao: 'Monitor Dell 24"',
                categoria: 'Informática',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-12',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0121',
                descricao: 'Teclado Logitech',
                categoria: 'Informática',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-12',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0122',
                descricao: 'Mouse Logitech',
                categoria: 'Informática',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-12',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0130',
                descricao: 'Notebook Dell Latitude',
                categoria: 'Informática',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-15',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0134',
                descricao: 'Webcam Logitech',
                categoria: 'Equipamentos',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-20',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0140',
                descricao: 'Headset profissional',
                categoria: 'Equipamentos',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-20',
                conservacao: 'Bom'
            },
            {
                codigo: 'PT-0148',
                descricao: 'Monitor LG 27"',
                categoria: 'Informática',
                responsavel: 'Anderson',
                status: 'Cautelado',
                dataCadastro: '2026-08-25',
                conservacao: 'Bom'
            }
        ],
        usuarios: [
            {
                nome: 'João Silva',
                departamento: 'Tecnologia da Informação',
                matricula: '001245',
                patrimonioCount: 4,
                status: 'Ativo'
            },
            {
                nome: 'Carla Souza',
                departamento: 'Administrativo',
                matricula: '001266',
                patrimonioCount: 2,
                status: 'Ativo'
            },
            {
                nome: 'Carlos Oliveira',
                departamento: 'Financeiro',
                matricula: '001288',
                patrimonioCount: 1,
                status: 'Ativo'
            },
            {
                nome: 'Anderson',
                departamento: 'Financeiro',
                matricula: '001299',
                patrimonioCount: 8,
                status: 'Ativo'
            }
        ],
        estoque: [
            {
                produto: 'Papel A4',
                categoria: 'Material de escritório',
                quantidade: 320,
                minimo: 100,
                situacao: 'Normal'
            },
            {
                produto: 'Caneta azul',
                categoria: 'Material de escritório',
                quantidade: 42,
                minimo: 50,
                situacao: 'Estoque baixo'
            },
            {
                produto: 'Mouse USB',
                categoria: 'Informática',
                quantidade: 87,
                minimo: 30,
                situacao: 'Normal'
            }
        ],
        movimentacoes: [
            {
                data: '25/08/2026',
                patrimonio: 'PT-0148',
                acao: 'Cautela',
                responsavel: 'Anderson',
                registradoPor: 'Administrador'
            },
            {
                data: '20/08/2026',
                patrimonio: 'PT-0140',
                acao: 'Cautela',
                responsavel: 'Anderson',
                registradoPor: 'Administrador'
            },
            {
                data: '20/08/2026',
                patrimonio: 'PT-0134',
                acao: 'Cautela',
                responsavel: 'Anderson',
                registradoPor: 'Administrador'
            },
            {
                data: '12/08/2026',
                patrimonio: 'PT-0108',
                acao: 'Cautela',
                responsavel: 'Anderson',
                registradoPor: 'Administrador'
            },
            {
                data: '04/09/2026',
                patrimonio: 'PT-0001',
                acao: 'Cautela',
                responsavel: 'João Silva',
                registradoPor: 'Administrador'
            }
        ],
        clientes: [
            {
                usuario: 'carlasouza',
                senha: '123',
                nome: 'Carla Souza',
                departamento: 'Administrativo',
                patrimonios: ['PT-0003', 'PT-0004']
            },
            {
                usuario: 'anderson',
                senha: '123456',
                nome: 'Anderson',
                departamento: 'Financeiro',
                patrimonios: ['PT-0108', 'PT-0114', 'PT-0121', 'PT-0122', 'PT-0130', 'PT-0134', 'PT-0140', 'PT-0148']
            }
        ],
        manutencoes: [
            {
                id: 'MNT-0001',
                patrimonioId: null,
                patrimonioCodigo: 'PT-0004',
                patrimonioNome: 'Computador Desktop',
                patrimonioCategoria: 'Informática',
                patrimonioResponsavel: 'Carla Souza',
                patrimonioDepartamento: 'Administrativo',
                patrimonioConservacao: 'Necessita manutenção',
                statusAnterior: 'Cautelado',
                problema: 'Equipamento encaminhado para verificação técnica preventiva e revisão de hardware.',
                status: 'Em manutenção',
                dataAbertura: '2026-09-05',
                dataConclusao: null
            }
        ],
        currentUser: null
    };

    const MaintenanceService = window.StockFlowMaintenance;
    let appState = loadState();
    let currentScreen = 'dashboard';
    let navigationHistory = [];
    let backendDisponivel = false;
    let isSelectingForMaintenance = false;

    function loadState() {
        let baseState = JSON.parse(JSON.stringify(defaultState));

        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && Array.isArray(saved.patrimonios)) {
                baseState = { ...baseState, ...saved };
                if (!Array.isArray(saved.manutencoes)) {
                    delete baseState.manutencoes;
                }
            }
        } catch (error) {
            console.warn('Estado local não carregado:', error);
        }

        if (MaintenanceService) {
            MaintenanceService.ensureMaintenanceSchema(baseState, defaultState.manutencoes);
        } else if (!Array.isArray(baseState.manutencoes)) {
            baseState.manutencoes = [];
        }

        return baseState;
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getMaintenanceContext() {
        return {
            getState: () => appState,
            setState: (nextState) => {
                appState = nextState;
            },
            persistState: () => {
                saveState();
            }
        };
    }

    async function apiRequest(url, options = {}) {
        const resposta = await fetch(url, {
            ...options,
            credentials: 'same-origin'
        });

        const texto = await resposta.text();
        let dados = null;

        try {
            dados = texto ? JSON.parse(texto) : null;
        } catch (_err) {
            dados = null;
        }

        if (!resposta.ok) {
            throw new Error(dados?.erro || `Erro HTTP ${resposta.status} ao comunicar com o servidor.`);
        }

        if (dados === null) {
            throw new Error('Resposta inválida do servidor.');
        }

        return dados;
    }

    async function sincronizarComBackend() {
        if (!backendDisponivel) return;

        try {
            const [usuarios, patrimonios, manutencoes] = await Promise.all([
                apiRequest('/api/usuarios'),
                apiRequest('/api/patrimonios'),
                apiRequest('/api/manutencoes')
            ]);

            if (Array.isArray(usuarios) && usuarios.length > 0) {
                appState.usuarios = usuarios;
            }
            if (Array.isArray(patrimonios)) {
                appState.patrimonios = patrimonios;
            }
            if (Array.isArray(manutencoes)) {
                appState.manutencoes = manutencoes;
            }

            saveState();
            renderAll();
        } catch (error) {
            console.warn('Sincronização com backend indisponível:', error);
        }
    }

    function autenticarUsuarioLocal(usuario, senha) {
        if (usuario === 'admin' && senha === 'admin') {
            return { nome: 'Administrador', tipo: 'admin', usuario: 'admin', departamento: 'Tecnologia da Informação' };
        }
        if (usuario === 'ti' && senha === '123') {
            return { nome: 'Equipe de TI', tipo: 'ti', usuario: 'ti', departamento: 'Tecnologia da Informação' };
        }
        const cliente = appState.clientes.find(
            (c) => c.usuario === usuario && c.senha === senha
        );
        if (cliente) {
            return { ...cliente, tipo: 'cliente' };
        }
        return null;
    }

    function syncDateField() {
        const dateField = document.getElementById('dataCadastro');
        if (!dateField) return;
        if (!dateField.value) {
            dateField.value = new Date().toISOString().split('T')[0];
        }
    }

    function getStatusBadge(status) {
        const map = {
            Disponível: 'available',
            Cautelado: 'cautioned',
            Manutenção: 'maintenance',
            Ativo: 'available',
            'Estoque baixo': 'maintenance',
            Normal: 'available'
        };

        return map[status] || 'available';
    }

    function isAdmin() {
        return Boolean(appState.currentUser && (appState.currentUser.tipo === 'admin' || appState.currentUser.tipo === 'ti'));
    }

    async function excluirPatrimonio(codigo) {
        if (!isAdmin()) {
            alert('Acesso negado. Apenas o Administrador pode excluir patrimónios.');
            return;
        }
        const openMaint = MaintenanceService?.getOpenMaintenanceByAsset(appState, codigo);
        if (openMaint) {
            alert(`Não é possível excluir o patrimônio ${codigo} enquanto a manutenção ${openMaint.id} estiver em aberto.`);
            return;
        }
        if (!confirm(`Tem certeza que deseja excluir o patrimônio ${codigo}?`)) return;

        const patObj = appState.patrimonios.find(p => p.codigo === codigo);
        if (backendDisponivel && patObj?.id) {
            try {
                await apiRequest(`/api/patrimonios/${patObj.id}`, { method: 'DELETE' });
                await sincronizarComBackend();
                showPatrimonioFeedback(`Patrimônio ${codigo} excluído com sucesso.`);
                return;
            } catch (error) {
                alert(error.message);
                return;
            }
        }

        appState.patrimonios = appState.patrimonios.filter(p => p.codigo !== codigo);
        saveState();
        renderAll();
    }

    function excluirUsuario(nome) {
        if (!isAdmin()) {
            alert('Acesso negado. Apenas o Administrador pode excluir usuários.');
            return;
        }
        if (!confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) return;
        appState.usuarios = appState.usuarios.filter(u => u.nome !== nome);
        saveState();
        renderAll();
    }

    function showPatrimonioFeedback(message) {
        const alertBox = document.getElementById('patrimonioAlert');
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.style.display = 'block';
        clearTimeout(alertBox._hideTimer);
        alertBox._hideTimer = setTimeout(() => {
            alertBox.style.display = 'none';
        }, 4000);
    }

    function showManutencaoFeedback(message) {
        const alertBox = document.getElementById('manutencaoAlert');
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.style.display = 'block';
        clearTimeout(alertBox._hideTimer);
        alertBox._hideTimer = setTimeout(() => {
            alertBox.style.display = 'none';
        }, 4500);
    }

    function setModalError(elementId, message) {
        const errorBox = document.getElementById(elementId);
        if (!errorBox) return;
        if (!message) {
            errorBox.textContent = '';
            errorBox.classList.remove('visible');
            return;
        }
        errorBox.textContent = message;
        errorBox.classList.add('visible');
    }

    function renderPatrimonios() {
        const table = document.getElementById('patrimonioTable');
        if (!table) return;

        const admin = isAdmin();
        const selectionBanner = document.getElementById('selecaoManutencaoBanner');
        if (selectionBanner) {
            selectionBanner.classList.toggle('visible', isSelectingForMaintenance);
        }

        table.innerHTML = appState.patrimonios.map((item) => {
            const openMaint = MaintenanceService?.getOpenMaintenanceByAsset(appState, item.codigo);
            const emManutencao = item.status === 'Manutenção' || Boolean(openMaint);

            let actionsHtml = '';
            if (isSelectingForMaintenance) {
                actionsHtml = emManutencao
                    ? `<button type="button" class="table-btn-muted" onclick="abrirManutencaoDoPatrimonio('${escapeHtml(item.codigo)}')">Em manutenção</button>`
                    : `<button type="button" class="table-btn" onclick="abrirModalEncaminharManutencao('${escapeHtml(item.codigo)}')">Manutenção</button>`;
            } else {
                const editAction = `<button type="button" class="table-btn-edit" onclick="abrirModalEditarPatrimonio('${escapeHtml(item.codigo)}')">Editar</button>`;
                const deleteAction = admin
                    ? `<button type="button" class="table-btn-danger" onclick="excluirPatrimonio('${escapeHtml(item.codigo)}')">Excluir</button>`
                    : '';
                actionsHtml = `${editAction}${deleteAction}`;
            }

            return `
                <tr>
                    <td>${escapeHtml(item.codigo)}</td>
                    <td>${escapeHtml(item.descricao)}</td>
                    <td>${escapeHtml(item.categoria)}</td>
                    <td>${escapeHtml(item.responsavel || '—')}</td>
                    <td>
                        <span class="status ${getStatusBadge(item.status)}">${escapeHtml(item.status)}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            ${actionsHtml}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderManutencoes() {
        const table = document.getElementById('manutencaoTable');
        const list = Array.isArray(appState.manutencoes) ? appState.manutencoes : [];

        const totalEl = document.getElementById('maintTotalCount');
        const waitingEl = document.getElementById('maintWaitingCount');
        const progressEl = document.getElementById('maintProgressCount');
        const doneEl = document.getElementById('maintDoneCount');

        if (totalEl) totalEl.textContent = list.length;
        if (waitingEl) waitingEl.textContent = list.filter(item => item.status === 'Em espera').length;
        if (progressEl) progressEl.textContent = list.filter(item => item.status === 'Em manutenção').length;
        if (doneEl) doneEl.textContent = list.filter(item => item.status === 'Concluído').length;

        if (!table) return;

        const statusFilter = document.getElementById('filtroStatusManutencao')?.value || 'Todos';
        const searchTerm = (document.getElementById('filtroBuscaManutencao')?.value || '').trim().toLowerCase();

        const filtered = list.filter((item) => {
            if (statusFilter === 'Abertas' && item.status === 'Concluído') return false;
            if (statusFilter !== 'Todos' && statusFilter !== 'Abertas' && item.status !== statusFilter) return false;

            if (searchTerm) {
                const haystack = `${item.patrimonioCodigo} ${item.patrimonioNome} ${item.patrimonioCategoria} ${item.id}`.toLowerCase();
                if (!haystack.includes(searchTerm)) return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty">
                        Nenhuma solicitação de manutenção encontrada para os filtros selecionados.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = filtered.map((item) => {
            const badgeClass = MaintenanceService ? MaintenanceService.getStatusBadgeClass(item.status) : 'maint-waiting';
            const dataFormatada = MaintenanceService ? MaintenanceService.formatDateBR(item.dataAbertura) : item.dataAbertura;

            return `
                <tr class="clickable-row" onclick="abrirModalDetalhesManutencao('${escapeHtml(item.id)}')">
                    <td><strong>${escapeHtml(item.patrimonioCodigo)}</strong></td>
                    <td>${escapeHtml(item.patrimonioNome)}</td>
                    <td>${escapeHtml(item.patrimonioCategoria)}</td>
                    <td>
                        <span class="status ${badgeClass}">${escapeHtml(item.status)}</span>
                    </td>
                    <td>${escapeHtml(dataFormatada)}</td>
                    <td>
                        <button type="button"
                                class="table-btn"
                                onclick="event.stopPropagation(); abrirModalDetalhesManutencao('${escapeHtml(item.id)}')">
                            Detalhes
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function filtrarManutencoes() {
        renderManutencoes();
    }

    function abrirModalEditarPatrimonio(codigoPatrimonio) {
        const patrimonio = appState.patrimonios.find(item => item.codigo === codigoPatrimonio);
        if (!patrimonio) {
            alert('Patrimônio não encontrado.');
            return;
        }

        setModalError('editarPatrimonioErro', '');

        const openMaint = MaintenanceService?.getOpenMaintenanceByAsset(appState, codigoPatrimonio);
        const emManutencaoAberta = Boolean(openMaint);

        const codigoOriginalInput = document.getElementById('editarCodigoOriginal');
        const tomboInput = document.getElementById('editarNumeroPatrimonio');
        const categoriaSelect = document.getElementById('editarCategoriaPatrimonio');
        const descricaoInput = document.getElementById('editarDescricaoPatrimonio');
        const responsavelSelect = document.getElementById('editarResponsavelPatrimonio');
        const conservacaoSelect = document.getElementById('editarConservacaoPatrimonio');
        const dataInput = document.getElementById('editarDataCadastroPatrimonio');
        const statusSelect = document.getElementById('editarStatusPatrimonio');
        const avisoEl = document.getElementById('editarStatusAviso');

        if (codigoOriginalInput) codigoOriginalInput.value = patrimonio.codigo;
        if (tomboInput) tomboInput.value = patrimonio.codigo;
        if (descricaoInput) descricaoInput.value = patrimonio.descricao;

        if (categoriaSelect) {
            const cat = patrimonio.categoria || '';
            const hasOption = Array.from(categoriaSelect.options).some(opt => opt.value === cat || opt.text === cat);
            if (cat && !hasOption) {
                categoriaSelect.add(new Option(cat, cat));
            }
            categoriaSelect.value = cat;
        }

        if (responsavelSelect) {
            responsavelSelect.innerHTML = '<option value="—">Sem responsável (—)</option>';
            appState.usuarios.forEach((u) => {
                const option = new Option(`${u.nome} (${u.departamento})`, u.nome);
                responsavelSelect.add(option);
            });
            const respAtual = patrimonio.responsavel || '—';
            const existsResp = Array.from(responsavelSelect.options).some(opt => opt.value === respAtual);
            if (respAtual !== '—' && !existsResp) {
                responsavelSelect.add(new Option(respAtual, respAtual));
            }
            responsavelSelect.value = respAtual;
        }

        if (conservacaoSelect) {
            conservacaoSelect.value = patrimonio.conservacao || 'Bom';
        }
        if (dataInput) {
            dataInput.value = patrimonio.dataCadastro || (MaintenanceService ? MaintenanceService.getTodayISO() : '');
        }
        if (statusSelect) {
            statusSelect.value = patrimonio.status || 'Disponível';
            statusSelect.disabled = emManutencaoAberta;
        }
        if (avisoEl) {
            if (emManutencaoAberta) {
                avisoEl.className = 'modal-note warning';
                avisoEl.innerHTML = `Este patrimônio possui a solicitação <strong>${escapeHtml(openMaint.id)}</strong> em aberto. O status permanece bloqueado como <strong>Manutenção</strong> até a conclusão do atendimento.`;
            } else {
                avisoEl.className = 'modal-note';
                avisoEl.innerHTML = 'Altere os dados cadastrais desejados. Para enviar o equipamento à manutenção com registro de defeito e restauração automática de status, utilize o botão <strong>Manutenção</strong>.';
            }
        }

        const modal = document.getElementById('modalEditarPatrimonio');
        if (modal) modal.classList.add('open');
        if (descricaoInput) setTimeout(() => descricaoInput.focus(), 50);
    }

    function fecharModalEditarPatrimonio() {
        const modal = document.getElementById('modalEditarPatrimonio');
        if (modal) modal.classList.remove('open');
        setModalError('editarPatrimonioErro', '');
    }

    async function salvarEdicaoPatrimonio(event) {
        event.preventDefault();

        const codigoOriginal = document.getElementById('editarCodigoOriginal')?.value;
        const codigo = document.getElementById('editarNumeroPatrimonio')?.value;
        const categoria = document.getElementById('editarCategoriaPatrimonio')?.value;
        const descricao = document.getElementById('editarDescricaoPatrimonio')?.value;
        const responsavel = document.getElementById('editarResponsavelPatrimonio')?.value;
        const conservacao = document.getElementById('editarConservacaoPatrimonio')?.value;
        const dataCadastro = document.getElementById('editarDataCadastroPatrimonio')?.value;
        const status = document.getElementById('editarStatusPatrimonio')?.value;

        const patObj = appState.patrimonios.find(p => p.codigo === codigoOriginal);

        if (backendDisponivel && patObj?.id) {
            try {
                await apiRequest(`/api/patrimonios/${patObj.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        codigo,
                        descricao,
                        categoria,
                        responsavel,
                        conservacao,
                        dataCadastro,
                        status
                    })
                });
                await sincronizarComBackend();
                fecharModalEditarPatrimonio();
                showPatrimonioFeedback(`Patrimônio ${codigo.trim()} atualizado com sucesso.`);
                return;
            } catch (error) {
                setModalError('editarPatrimonioErro', error.message);
                return;
            }
        }

        if (!MaintenanceService) return;

        const result = MaintenanceService.editarPatrimonio(getMaintenanceContext(), {
            codigoOriginal,
            codigo,
            descricao,
            categoria,
            responsavel,
            conservacao,
            dataCadastro,
            status
        });

        if (!result.ok) {
            setModalError('editarPatrimonioErro', result.error);
            return;
        }

        fecharModalEditarPatrimonio();
        renderAll();
        showPatrimonioFeedback(`Patrimônio ${result.data.codigo} atualizado com sucesso.`);
    }

    function abrirModalEncaminharManutencao(codigoPatrimonio) {
        const patrimonio = appState.patrimonios.find(item => item.codigo === codigoPatrimonio);
        if (!patrimonio) {
            alert('Patrimônio não encontrado.');
            return;
        }

        const openMaint = MaintenanceService?.getOpenMaintenanceByAsset(appState, codigoPatrimonio);
        if (patrimonio.status === 'Manutenção' || openMaint) {
            if (openMaint) {
                abrirModalDetalhesManutencao(openMaint.id);
            } else {
                alert('Este equipamento já se encontra em manutenção.');
            }
            return;
        }

        setModalError('encaminharManutencaoErro', '');

        const inputCodigo = document.getElementById('encaminharCodigoPatrimonio');
        const tomboEl = document.getElementById('encaminharTombo');
        const statusEl = document.getElementById('encaminharStatusAtual');
        const nomeEl = document.getElementById('encaminharNomeEquipamento');
        const respSetorEl = document.getElementById('encaminharResponsavelSetor');
        const caractEl = document.getElementById('encaminharCaracteristicas');
        const dataEl = document.getElementById('manutencaoDataAbertura');
        const problemaEl = document.getElementById('manutencaoProblema');

        const departamento = patrimonio.departamento
            || (MaintenanceService ? MaintenanceService.findUsuarioDepartamento(appState, patrimonio.responsavel) : 'Não vinculado');

        if (inputCodigo) inputCodigo.value = patrimonio.codigo;
        if (tomboEl) tomboEl.textContent = patrimonio.codigo;
        if (statusEl) {
            statusEl.innerHTML = `<span class="status ${getStatusBadge(patrimonio.status)}">${escapeHtml(patrimonio.status)}</span>`;
        }
        if (nomeEl) nomeEl.textContent = patrimonio.descricao;
        if (respSetorEl) {
            respSetorEl.textContent = `Responsável: ${patrimonio.responsavel || '—'} · Setor: ${departamento}`;
        }
        if (caractEl) {
            const dataCad = MaintenanceService ? MaintenanceService.formatDateBR(patrimonio.dataCadastro) : (patrimonio.dataCadastro || '—');
            caractEl.textContent = `Categoria: ${patrimonio.categoria || '—'} · Conservação: ${patrimonio.conservacao || '—'} · Cadastro: ${dataCad}`;
        }
        if (dataEl) dataEl.value = MaintenanceService ? MaintenanceService.getTodayISO() : new Date().toISOString().split('T')[0];
        if (problemaEl) problemaEl.value = '';

        const modal = document.getElementById('modalEncaminharManutencao');
        if (modal) modal.classList.add('open');
        if (problemaEl) setTimeout(() => problemaEl.focus(), 50);
    }

    function fecharModalEncaminharManutencao() {
        const modal = document.getElementById('modalEncaminharManutencao');
        if (modal) modal.classList.remove('open');
        setModalError('encaminharManutencaoErro', '');
    }

    async function confirmarEncaminhamentoManutencao(event) {
        event.preventDefault();

        const codigoPatrimonio = document.getElementById('encaminharCodigoPatrimonio')?.value;
        const dataAbertura = document.getElementById('manutencaoDataAbertura')?.value;
        const problema = document.getElementById('manutencaoProblema')?.value;

        if (backendDisponivel) {
            try {
                const criada = await apiRequest('/api/manutencoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigoPatrimonio, problema, dataAbertura })
                });
                await sincronizarComBackend();
                fecharModalEncaminharManutencao();
                navigate('manutencao');
                showManutencaoFeedback(`Patrimônio ${codigoPatrimonio} encaminhado para manutenção (${criada.id}) com status inicial "Em espera".`);
                return;
            } catch (error) {
                setModalError('encaminharManutencaoErro', error.message);
                return;
            }
        }

        if (!MaintenanceService) return;

        const result = MaintenanceService.abrirManutencao(getMaintenanceContext(), {
            codigoPatrimonio,
            problema,
            dataAbertura
        });

        if (!result.ok) {
            setModalError('encaminharManutencaoErro', result.error);
            return;
        }

        fecharModalEncaminharManutencao();
        renderAll();
        navigate('manutencao');
        showManutencaoFeedback(`Patrimônio ${codigoPatrimonio} encaminhado para manutenção (${result.data.id}) com status inicial "Em espera".`);
    }

    function abrirManutencaoDoPatrimonio(codigoPatrimonio) {
        const openMaint = MaintenanceService?.getOpenMaintenanceByAsset(appState, codigoPatrimonio);
        if (openMaint) {
            abrirModalDetalhesManutencao(openMaint.id);
            return;
        }
        navigate('manutencao');
    }

    function atualizarAvisoStatusDetalhes() {
        const manutencaoId = document.getElementById('detalhesManutencaoId')?.value;
        const novoStatus = document.getElementById('detalhesNovoStatus')?.value;
        const avisoEl = document.getElementById('detalhesAvisoIntegracao');
        if (!avisoEl || !MaintenanceService) return;

        const manutencao = MaintenanceService.getMaintenanceById(appState, manutencaoId);
        if (!manutencao) return;

        if (manutencao.status === 'Concluído' || novoStatus === 'Concluído') {
            avisoEl.className = 'modal-note success';
            avisoEl.innerHTML = `Ao marcar como <strong>Concluído</strong>, o patrimônio retornará automaticamente para o status anterior <strong>${escapeHtml(manutencao.statusAnterior)}</strong> e o histórico será preservado.`;
            return;
        }

        avisoEl.className = 'modal-note';
        avisoEl.innerHTML = `Enquanto estiver como <strong>${escapeHtml(novoStatus)}</strong>, o status geral do patrimônio permanecerá como <strong>Manutenção</strong>.`;
    }

    function abrirModalDetalhesManutencao(manutencaoId) {
        if (!MaintenanceService) return;
        const manutencao = MaintenanceService.getMaintenanceById(appState, manutencaoId);
        if (!manutencao) {
            alert('Solicitação de manutenção não encontrada.');
            return;
        }

        const patrimonio = appState.patrimonios.find(item => item.codigo === manutencao.patrimonioCodigo);
        setModalError('detalhesManutencaoErro', '');

        const idInput = document.getElementById('detalhesManutencaoId');
        const tomboEl = document.getElementById('detalhesTombo');
        const categoriaEl = document.getElementById('detalhesCategoria');
        const nomeEl = document.getElementById('detalhesNomeEquipamento');
        const respSetorEl = document.getElementById('detalhesResponsavelSetor');
        const statusPatEl = document.getElementById('detalhesStatusPatrimonio');
        const statusAntEl = document.getElementById('detalhesStatusAnterior');
        const caractEl = document.getElementById('detalhesCaracteristicas');
        const codSolEl = document.getElementById('detalhesCodigoSolicitacao');
        const statusManBadgeEl = document.getElementById('detalhesStatusManutencaoBadge');
        const dataAbEl = document.getElementById('detalhesDataAbertura');
        const dataConcEl = document.getElementById('detalhesDataConclusao');
        const problemaEl = document.getElementById('detalhesProblema');
        const selectStatus = document.getElementById('detalhesNovoStatus');
        const btnSalvar = document.getElementById('btnSalvarDetalhesManutencao');

        const statusAtualPatrimonio = patrimonio ? patrimonio.status : 'Indisponível';
        const nomeEquipamento = patrimonio ? patrimonio.descricao : manutencao.patrimonioNome;
        const categoria = patrimonio ? patrimonio.categoria : manutencao.patrimonioCategoria;
        const responsavel = patrimonio ? (patrimonio.responsavel || '—') : (manutencao.patrimonioResponsavel || '—');
        const departamento = patrimonio?.departamento
            || manutencao.patrimonioDepartamento
            || MaintenanceService.findUsuarioDepartamento(appState, responsavel);
        const conservacao = patrimonio ? (patrimonio.conservacao || '—') : (manutencao.patrimonioConservacao || '—');

        if (idInput) idInput.value = manutencao.id;
        if (tomboEl) tomboEl.textContent = manutencao.patrimonioCodigo;
        if (categoriaEl) categoriaEl.textContent = categoria;
        if (nomeEl) nomeEl.textContent = nomeEquipamento;
        if (respSetorEl) respSetorEl.textContent = `Responsável: ${responsavel} · Setor: ${departamento}`;
        if (statusPatEl) {
            statusPatEl.innerHTML = `<span class="status ${getStatusBadge(statusAtualPatrimonio)}">${escapeHtml(statusAtualPatrimonio)}</span>`;
        }
        if (statusAntEl) {
            statusAntEl.innerHTML = `<span class="status ${getStatusBadge(manutencao.statusAnterior)}">${escapeHtml(manutencao.statusAnterior)}</span>`;
        }
        if (caractEl) {
            caractEl.textContent = `Descrição: ${nomeEquipamento} · Conservação: ${conservacao}`;
        }
        if (codSolEl) codSolEl.textContent = manutencao.id;
        if (statusManBadgeEl) {
            statusManBadgeEl.innerHTML = `<span class="status ${MaintenanceService.getStatusBadgeClass(manutencao.status)}">${escapeHtml(manutencao.status)}</span>`;
        }
        if (dataAbEl) dataAbEl.textContent = MaintenanceService.formatDateBR(manutencao.dataAbertura);
        if (dataConcEl) {
            dataConcEl.textContent = manutencao.dataConclusao ? MaintenanceService.formatDateBR(manutencao.dataConclusao) : 'Em aberto';
        }
        if (problemaEl) problemaEl.textContent = manutencao.problema;

        const concluida = manutencao.status === 'Concluído';
        if (selectStatus) {
            selectStatus.value = manutencao.status;
            selectStatus.disabled = concluida;
        }
        if (btnSalvar) {
            btnSalvar.style.display = concluida ? 'none' : 'inline-block';
        }

        atualizarAvisoStatusDetalhes();

        const modal = document.getElementById('modalDetalhesManutencao');
        if (modal) modal.classList.add('open');
    }

    function fecharModalDetalhesManutencao() {
        const modal = document.getElementById('modalDetalhesManutencao');
        if (modal) modal.classList.remove('open');
        setModalError('detalhesManutencaoErro', '');
    }

    async function salvarAlteracaoManutencao(event) {
        event.preventDefault();

        const manutencaoId = document.getElementById('detalhesManutencaoId')?.value;
        const novoStatus = document.getElementById('detalhesNovoStatus')?.value;

        if (backendDisponivel) {
            try {
                const atualizada = await apiRequest(`/api/manutencoes/${encodeURIComponent(manutencaoId)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ novoStatus })
                });
                await sincronizarComBackend();
                fecharModalDetalhesManutencao();
                if (novoStatus === 'Concluído') {
                    showManutencaoFeedback(`Manutenção ${manutencaoId} concluída! O patrimônio ${atualizada.patrimonioCodigo} retornou para "${atualizada.statusAnterior}".`);
                } else {
                    showManutencaoFeedback(`Status da manutenção ${manutencaoId} atualizado para "${novoStatus}".`);
                }
                return;
            } catch (error) {
                setModalError('detalhesManutencaoErro', error.message);
                return;
            }
        }

        if (!MaintenanceService) return;

        const result = MaintenanceService.atualizarStatusManutencao(getMaintenanceContext(), {
            manutencaoId,
            novoStatus
        });

        if (!result.ok) {
            setModalError('detalhesManutencaoErro', result.error);
            return;
        }

        fecharModalDetalhesManutencao();
        renderAll();

        if (novoStatus === 'Concluído') {
            showManutencaoFeedback(`Manutenção ${manutencaoId} concluída! O patrimônio ${result.data.patrimonioCodigo} retornou para "${result.data.statusAnterior}".`);
        } else {
            showManutencaoFeedback(`Status da manutenção ${manutencaoId} atualizado para "${novoStatus}".`);
        }
    }

    function renderUsuarios() {
        const table = document.querySelector('#usuarios tbody');
        if (!table) return;

        const admin = isAdmin();

        table.innerHTML = appState.usuarios.map((usuario) => `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.departamento}</td>
                <td>${usuario.patrimonioCount}</td>
                <td>
                    <span class="status ${getStatusBadge(usuario.status)}">${usuario.status}</span>
                </td>
                <td>
                    ${admin ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="excluirUsuario('${usuario.nome}')">Excluir</button>` : '<span style="color: var(--text-muted); font-size: 12px;">Restrito</span>'}
                </td>
            </tr>
        `).join('');
    }

    function renderEstoque() {
        const table = document.querySelector('#estoque tbody');
        if (!table) return;

        table.innerHTML = appState.estoque.map((item) => `
            <tr>
                <td>${item.produto}</td>
                <td>${item.categoria}</td>
                <td>${item.quantidade}</td>
                <td>${item.minimo}</td>
                <td>
                    <span class="status ${getStatusBadge(item.situacao)}">${item.situacao}</span>
                </td>
            </tr>
        `).join('');
    }

    function renderMovimentacoes() {
        const table = document.querySelector('#movimentacoes tbody');
        if (!table) return;

        table.innerHTML = appState.movimentacoes.map((item) => `
            <tr>
                <td>${item.data}</td>
                <td>${item.patrimonio}</td>
                <td>${item.acao}</td>
                <td>${item.responsavel || '—'}</td>
                <td>${item.registradoPor}</td>
            </tr>
        `).join('');
    }

    function renderClientPortal() {
        const clientName = document.querySelector('#client-portal strong');
        if (clientName) {
            clientName.textContent = appState.currentUser?.nome || 'Cliente';
        }

        const clientTopUser = document.querySelector('.client-top-user');
        if (clientTopUser) {
            clientTopUser.textContent = `${appState.currentUser?.nome || 'Cliente'} · Cliente`;
        }

        const clientWelcome = document.querySelector('#client-dashboard h1');
        if (clientWelcome && appState.currentUser?.nome) {
            clientWelcome.textContent = `Olá, ${appState.currentUser.nome}.`;
        }

        const currentClientName = appState.currentUser?.nome || 'Carla Souza';
        const clientBens = appState.patrimonios.filter(p => p.responsavel === currentClientName);

        const dashTable = document.getElementById('clientDashTable');
        if (dashTable) {
            dashTable.innerHTML = clientBens.slice(0, 4).map(item => `
                <tr>
                    <td>${item.codigo}</td>
                    <td>${item.descricao}</td>
                    <td>${item.categoria}</td>
                    <td><span class="status cautioned">Em uso</span></td>
                    <td>—</td>
                </tr>
            `).join('');
        }

        const patrimoniosTable = document.getElementById('clientPatrimoniosTable');
        if (patrimoniosTable) {
            patrimoniosTable.innerHTML = clientBens.map(item => `
                <tr>
                    <td>${item.codigo}</td>
                    <td>${item.descricao}</td>
                    <td>${item.categoria}</td>
                    <td>${item.dataCadastro || '12/08/2026'}</td>
                    <td><span class="status cautioned">Em uso</span></td>
                </tr>
            `).join('');
        }

        const movsTable = document.getElementById('clientMovsTable');
        if (movsTable) {
            const clientMovs = appState.movimentacoes.filter(m => m.responsavel === currentClientName);
            movsTable.innerHTML = clientMovs.map(mov => `
                <tr>
                    <td>${mov.data}</td>
                    <td>${mov.patrimonio}</td>
                    <td>${mov.acao}</td>
                    <td><span class="status cautioned">Em uso</span></td>
                </tr>
            `).join('');
        }

        const statCards = document.querySelectorAll('#client-dashboard .stat-card');
        if (statCards.length >= 3) {
            const totalBens = clientBens.length;
            const disponiveis = clientBens.filter(item => item.status === 'Disponível').length;
            const manutencao = clientBens.filter(item => item.status === 'Manutenção').length;

            const card1 = statCards[0].querySelector('strong');
            const card2 = statCards[1].querySelector('strong');
            const card3 = statCards[2].querySelector('strong');

            if (card1) card1.textContent = totalBens;
            if (card2) card2.textContent = disponiveis;
            if (card3) card3.textContent = manutencao;
        }
    }

    function renderDashboardTotals() {
        const dashboardCards = document.querySelectorAll('#dashboard .stat-card strong');
        const dashboardValues = [
            dashboardCards[0],
            dashboardCards[1],
            dashboardCards[2],
            dashboardCards[3]
        ];

        if (appState.currentUser && appState.currentUser.tipo !== 'admin' && appState.currentUser.tipo !== 'ti') {
            return;
        }

        const totalPatrimonios = appState.patrimonios.length;
        const disponiveis = appState.patrimonios.filter((item) => item.status === 'Disponível').length;
        const cautelados = appState.patrimonios.filter((item) => item.status === 'Cautelado').length;
        const manutencao = appState.patrimonios.filter((item) => item.status === 'Manutenção').length;

        if (dashboardValues[0]) dashboardValues[0].textContent = totalPatrimonios;
        if (dashboardValues[1]) dashboardValues[1].textContent = disponiveis;
        if (dashboardValues[2]) dashboardValues[2].textContent = cautelados;
        if (dashboardValues[3]) dashboardValues[3].textContent = manutencao;
    }

    function renderAll() {
        renderPatrimonios();
        renderManutencoes();
        renderUsuarios();
        renderEstoque();
        renderMovimentacoes();
        syncDateField();
        renderClientPortal();
        renderDashboardTotals();
    }

    function openApp() {
        const landing = document.getElementById('landing');
        const app = document.getElementById('app');
        const clientLogin = document.getElementById('client-login');
        const clientPortal = document.getElementById('client-portal');

        if (landing) landing.style.display = 'none';
        if (app) app.style.display = 'block';
        if (clientLogin) clientLogin.style.display = 'none';
        if (clientPortal) clientPortal.style.display = 'none';

        navigationHistory = [];
        currentScreen = 'dashboard';
        showScreen('dashboard');
        renderAll();
    }

    function iniciarSelecaoManutencao() {
        isSelectingForMaintenance = true;
        navigate('patrimonios', { selectForMaintenance: true });
    }

    function cancelarSelecaoManutencao() {
        isSelectingForMaintenance = false;
        renderPatrimonios();
        navigate('manutencao');
    }

    function showScreen(screen) {
        if (screen !== 'patrimonios') {
            isSelectingForMaintenance = false;
        }

        const pages = document.querySelectorAll('.page');
        pages.forEach((page) => page.classList.remove('active'));

        const target = document.getElementById(screen);
        if (target) target.classList.add('active');

        document.querySelectorAll('.menu-button').forEach((button) => {
            button.classList.toggle('active', button.dataset.screen === screen);
        });

        if (screen === 'patrimonios') {
            renderPatrimonios();
        }

        if (screen === 'nova-movimentacao') {
            carregarSelectsMovimentacao();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function navigate(screen, options = {}) {
        if (!screen) return;
        isSelectingForMaintenance = Boolean(options.selectForMaintenance && screen === 'patrimonios');
        navigationHistory.push(currentScreen);
        currentScreen = screen;
        showScreen(screen);
    }

    function goBack() {
        isSelectingForMaintenance = false;
        if (navigationHistory.length === 0) {
            const app = document.getElementById('app');
            const landing = document.getElementById('landing');
            if (app) app.style.display = 'none';
            if (landing) landing.style.display = 'block';
            window.scrollTo(0, 0);
            return;
        }

        const previousScreen = navigationHistory.pop();
        currentScreen = previousScreen;
        showScreen(previousScreen);
    }

    function openClientLogin() {
        const landing = document.getElementById('landing');
        const app = document.getElementById('app');
        const clientPortal = document.getElementById('client-portal');
        const clientLogin = document.getElementById('client-login');

        if (landing) landing.style.display = 'none';
        if (app) app.style.display = 'none';
        if (clientPortal) clientPortal.style.display = 'none';
        if (clientLogin) clientLogin.style.display = 'block';

        const loginUsuario = document.getElementById('loginUsuario');
        const loginSenha = document.getElementById('loginSenha');
        const loginError = document.getElementById('loginError');

        if (loginUsuario) loginUsuario.value = '';
        if (loginSenha) loginSenha.value = '';
        if (loginError) loginError.style.display = 'none';

        window.scrollTo(0, 0);
    }

    function backToLanding() {
        const clientLogin = document.getElementById('client-login');
        const clientPortal = document.getElementById('client-portal');
        const app = document.getElementById('app');
        const landing = document.getElementById('landing');

        if (clientLogin) clientLogin.style.display = 'none';
        if (clientPortal) clientPortal.style.display = 'none';
        if (app) app.style.display = 'none';
        if (landing) landing.style.display = 'block';

        window.scrollTo(0, 0);
    }

    async function loginCliente(event) {
        event.preventDefault();

        const usuario = document
            .getElementById('loginUsuario')
            .value.trim().toLowerCase();

        const senha = document
            .getElementById('loginSenha').value;

        const erro = document.getElementById('loginError');

        try {
            let dados = null;
            let usarAutenticacaoLocal = false;

            try {
                const resposta = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ usuario, senha })
                });

                const texto = await resposta.text();
                let payload = null;

                try {
                    payload = texto ? JSON.parse(texto) : null;
                } catch (_parseErr) {
                    payload = null;
                }

                if (payload !== null) {
                    if (!resposta.ok) {
                        throw new Error(payload.erro || 'Login inválido');
                    }
                    dados = payload;
                    backendDisponivel = true;
                } else if ([403, 404, 405, 501].includes(resposta.status)) {
                    // Servidor estático (ex.: Live Server / GitHub Pages) retornou resposta não-JSON como "Forbidden."
                    usarAutenticacaoLocal = true;
                } else {
                    throw new Error('Não foi possível interpretar a resposta do servidor de login.');
                }
            } catch (fetchError) {
                if (fetchError instanceof TypeError) {
                    usarAutenticacaoLocal = true;
                } else {
                    throw fetchError;
                }
            }

            if (usarAutenticacaoLocal) {
                backendDisponivel = false;
                dados = autenticarUsuarioLocal(usuario, senha);
                if (!dados) {
                    throw new Error('Usuário ou senha incorretos.');
                }
            }

            appState.currentUser = dados;

            if (erro) {
                erro.style.display = 'none';
            }

            if (backendDisponivel) {
                await sincronizarComBackend();
            }

            if (dados.tipo === 'admin' || dados.tipo === 'ti') {
                openApp();
                return;
            }

            document.getElementById('client-login')
                .style.display = 'none';

            document.getElementById('landing')
                .style.display = 'none';

            document.getElementById('app')
                .style.display = 'none';

            document.getElementById('client-portal')
                .style.display = 'block';

            showClientScreen('client-dashboard');

            renderAll();

            window.scrollTo(0, 0);

        } catch (error) {
            if (erro) {
                erro.textContent = error.message;
                erro.style.display = 'block';
            }

            console.error('Erro no login:', error);
        }
    }

    function logoutCliente() {
        if (backendDisponivel) {
            fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
        }
        backendDisponivel = false;
        appState.currentUser = null;
        const clientPortal = document.getElementById('client-portal');
        const clientLogin = document.getElementById('client-login');
        const landing = document.getElementById('landing');

        if (clientPortal) clientPortal.style.display = 'none';
        if (clientLogin) clientLogin.style.display = 'none';
        if (landing) landing.style.display = 'block';

        const loginUsuario = document.getElementById('loginUsuario');
        const loginSenha = document.getElementById('loginSenha');
        if (loginUsuario) loginUsuario.value = '';
        if (loginSenha) loginSenha.value = '';

        window.scrollTo(0, 0);
    }

    function logoutAdmin() {
        if (backendDisponivel) {
            fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
        }
        backendDisponivel = false;
        appState.currentUser = null;
        const app = document.getElementById('app');
        const landing = document.getElementById('landing');
        if (app) app.style.display = 'none';
        if (landing) landing.style.display = 'block';
        window.scrollTo(0, 0);
    }

    function showClientScreen(screen) {
        const pages = document.querySelectorAll('.client-page');
        pages.forEach((page) => page.classList.remove('active'));

        const target = document.getElementById(screen);
        if (target) target.classList.add('active');

        document.querySelectorAll('.client-menu').forEach((button) => {
            button.classList.toggle('active', button.dataset.clientScreen === screen);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function carregarSelectsMovimentacao() {
        const selectPatrimonio = document.getElementById('movPatrimonio');
        const selectUsuario = document.getElementById('movUsuario');

        if (selectPatrimonio) {
            selectPatrimonio.innerHTML = '<option value="">Selecione o patrimônio</option>';
            appState.patrimonios.forEach(p => {
                selectPatrimonio.innerHTML += `<option value="${p.codigo}">${p.codigo} - ${p.descricao}</option>`;
            });
        }

        if (selectUsuario) {
            selectUsuario.innerHTML = '<option value="">Selecione o usuário</option>';
            appState.usuarios.forEach(u => {
                selectUsuario.innerHTML += `<option value="${u.nome}">${u.nome} (${u.departamento})</option>`;
            });
        }
    }

    function criarMovimentacao(event) {
        event.preventDefault();
        const patId = document.getElementById('movPatrimonio').value;
        const userName = document.getElementById('movUsuario').value;

        if (!patId || !userName) return;

        const patObj = appState.patrimonios.find(p => p.codigo === patId);
        const openMaint = MaintenanceService?.getOpenMaintenanceByAsset(appState, patId);
        if (patObj?.status === 'Manutenção' || openMaint) {
            alert(`O patrimônio ${patId} está em manutenção e não pode ser cautelado até a conclusão do atendimento.`);
            return;
        }

        const dataAtual = new Date().toLocaleDateString('pt-BR');

        appState.movimentacoes.unshift({
            data: dataAtual,
            patrimonio: patId,
            acao: 'Cautela',
            responsavel: userName,
            registradoPor: 'Administrador'
        });

        if (patObj) {
            patObj.responsavel = userName;
            patObj.status = 'Cautelado';
        }

        saveState();
        renderAll();

        alert('Movimentação registrada com sucesso!');
        navigate('movimentacoes');
    }

    async function cadastrarPatrimonio(event) {
        event.preventDefault();

        const codigo = document.getElementById('numeroPatrimonio').value.trim();
        const descricao = document.getElementById('descricaoPatrimonio').value.trim();
        const categoria = document.getElementById('categoriaPatrimonio').value.trim();
        const conservacao = document.getElementById('conservacaoPatrimonio')?.value || 'Bom';
        const dataCadastro = document.getElementById('dataCadastro')?.value || new Date().toISOString().split('T')[0];

        if (!codigo || !descricao || !categoria) return;

        if (appState.patrimonios.some(p => p.codigo.trim().toLowerCase() === codigo.toLowerCase())) {
            alert(`Já existe um patrimônio cadastrado com o número de tombo ${codigo}.`);
            return;
        }

        if (backendDisponivel) {
            try {
                await apiRequest('/api/patrimonios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigo, descricao, categoria, conservacao, dataCadastro })
                });
                await sincronizarComBackend();
            } catch (error) {
                alert(error.message);
                return;
            }
        } else {
            const novoPatrimonio = {
                codigo,
                descricao,
                categoria,
                responsavel: '—',
                status: 'Disponível',
                dataCadastro,
                conservacao
            };

            appState.patrimonios.unshift(novoPatrimonio);
            appState.movimentacoes.unshift({
                data: new Date().toLocaleDateString('pt-BR'),
                patrimonio: codigo,
                acao: 'Cadastro',
                responsavel: '—',
                registradoPor: 'Administrador'
            });

            saveState();
            renderAll();
        }

        event.target.reset();
        syncDateField();

        showPatrimonioFeedback('Patrimônio cadastrado com sucesso.');

        navigationHistory.push('cadastro-patrimonio');
        currentScreen = 'patrimonios';
        showScreen('patrimonios');
    }

    function cadastrarUsuario(event) {
        event.preventDefault();

        const nome = document.getElementById('nomeUsuario').value.trim();
        const formFields = event.target.querySelectorAll('input, select');
        const departamento = formFields[1]?.value || 'Administrativo';

        if (!nome) return;

        const novoUsuario = {
            nome,
            departamento,
            matricula: `00${Math.floor(Math.random() * 900 + 100)}`,
            patrimonioCount: 0,
            status: 'Ativo'
        };

        appState.usuarios.push(novoUsuario);
        saveState();
        renderAll();

        alert(`Usuário ${nome} cadastrado com sucesso!`);
        event.target.reset();

        navigationHistory.push('cadastro-usuario');
        currentScreen = 'usuarios';
        showScreen('usuarios');
    }

    // Funções de controlo do menu mobile
    function toggleLandingNav() {
        const nav = document.getElementById('landingNav');
        if (nav) nav.classList.toggle('active');
    }

    function closeLandingNav() {
        const nav = document.getElementById('landingNav');
        if (nav) nav.classList.remove('active');
    }

    function toggleAdminSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
    }

    function toggleClientSidebar() {
        const sidebar = document.getElementById('clientSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
    }

    function closeAllSidebars() {
        const adminSidebar = document.getElementById('adminSidebar');
        const clientSidebar = document.getElementById('clientSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const landingNav = document.getElementById('landingNav');

        if (adminSidebar) adminSidebar.classList.remove('mobile-open');
        if (clientSidebar) clientSidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
        if (landingNav) landingNav.classList.remove('active');
    }

    function bootstrap() {
        renderAll();

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                fecharModalEditarPatrimonio();
                fecharModalEncaminharManutencao();
                fecharModalDetalhesManutencao();
            }
        });

        window.openApp = openApp;
        window.navigate = navigate;
        window.goBack = goBack;
        window.showScreen = showScreen;
        window.loginCliente = loginCliente;
        window.stockflowUsuarioAtual = function() {
            const usuario = appState.currentUser;

            if (!usuario) return null;

            return {
                usuario: usuario.usuario,
                nome: usuario.nome,
                departamento: usuario.departamento,
                tipo: usuario.tipo || 'cliente'
            };
        };
        window.showClientScreen = showClientScreen;
        window.logoutCliente = logoutCliente;
        window.logoutAdmin = logoutAdmin;
        window.backToLanding = backToLanding;
        window.cadastrarPatrimonio = cadastrarPatrimonio;
        window.cadastrarUsuario = cadastrarUsuario;
        window.openClientLogin = openClientLogin;
        window.criarMovimentacao = criarMovimentacao;
        window.excluirPatrimonio = excluirPatrimonio;
        window.excluirUsuario = excluirUsuario;
        window.abrirModalEditarPatrimonio = abrirModalEditarPatrimonio;
        window.fecharModalEditarPatrimonio = fecharModalEditarPatrimonio;
        window.salvarEdicaoPatrimonio = salvarEdicaoPatrimonio;
        window.abrirModalEncaminharManutencao = abrirModalEncaminharManutencao;
        window.fecharModalEncaminharManutencao = fecharModalEncaminharManutencao;
        window.confirmarEncaminhamentoManutencao = confirmarEncaminhamentoManutencao;
        window.abrirManutencaoDoPatrimonio = abrirManutencaoDoPatrimonio;
        window.abrirModalDetalhesManutencao = abrirModalDetalhesManutencao;
        window.fecharModalDetalhesManutencao = fecharModalDetalhesManutencao;
        window.atualizarAvisoStatusDetalhes = atualizarAvisoStatusDetalhes;
        window.salvarAlteracaoManutencao = salvarAlteracaoManutencao;
        window.filtrarManutencoes = filtrarManutencoes;
        window.iniciarSelecaoManutencao = iniciarSelecaoManutencao;
        window.cancelarSelecaoManutencao = cancelarSelecaoManutencao;
        window.toggleLandingNav = toggleLandingNav;
        window.closeLandingNav = closeLandingNav;
        window.toggleAdminSidebar = toggleAdminSidebar;
        window.toggleClientSidebar = toggleClientSidebar;
        window.closeAllSidebars = closeAllSidebars;
    }

    bootstrap();
})();
