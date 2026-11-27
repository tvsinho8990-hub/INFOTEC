/*
 * StockFlow - aplicação (front-end estático).
 * Os dados iniciais vêm de data.js (espelho de seed.sql).
 * Persistência: localStorage (chave "stockflowAppState").
 * ATENÇÃO: as credenciais abaixo são apenas de demonstração local.
 */
(() => {
    'use strict';

    const STORAGE_KEY = 'stockflowAppState';
    const STATE_VERSION = 2;
    const DEMO_ADMINS = {
        guto: { senha: 'guto123', nome: 'Guto Medeiros' },
        thiago: { senha: 'thiago123', nome: 'Thiago' }
    };
    const SESSION_KEY = 'stockflowSession';
    const DEMO_CLIENT_PASSWORDS = { anderson: '123456' };
    const REGISTRADO_POR = 'Administrador';
    const SEM_RESPONSAVEL = '—';
    const CONSERVACOES = ['Bom', 'Regular', 'Necessita manutenção'];
    const ACOES = ['Cautela', 'Transferência', 'Devolução', 'Manutenção', 'Baixa'];
    const APP_SCREENS = ['dashboard', 'patrimonios', 'cadastro-patrimonio', 'usuarios', 'cadastro-usuario', 'estoque', 'movimentacoes'];

    const DEFAULT_STATE = window.STOCKFLOW_DEFAULT_STATE;

    /* ---------- utilitários ---------- */

    const clone = (obj) => JSON.parse(JSON.stringify(obj));
    const pad = (n) => String(n).padStart(2, '0');
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
    const hojeISO = () => {
        const d = new Date();
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    const dataValida = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(iso || '')
        && !Number.isNaN(Date.parse(`${iso}T00:00:00Z`))
        && new Date(`${iso}T00:00:00Z`).toISOString().slice(0, 10) === iso;
    const toBR = (iso) => {
        const [y, m, d] = String(iso).split('-');
        return y && m && d ? `${d}/${m}/${y}` : String(iso);
    };
    const norm = (s) => String(s ?? '').trim().toLowerCase();
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    /* ---------- estado ---------- */

    function estadoValido(saved) {
        return Boolean(saved) && saved.version === STATE_VERSION
            && ['patrimonios', 'usuarios', 'estoque', 'movimentacoes', 'estoqueMovimentos', 'clientes']
                .every((key) => Array.isArray(saved[key]));
    }

    const RECOVERY_KEY = `${STORAGE_KEY}.recoveryBackup`;
    let storageRecoveryWarning = '';
    let storageWriteBlocked = false;

    function loadState() {
        let raw;

        try {
            raw = localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            storageWriteBlocked = true;
            storageRecoveryWarning = 'O navegador não permitiu acessar os dados salvos. A gravação foi bloqueada para proteger suas informações.';
            console.warn(storageRecoveryWarning, error);
            return { ...clone(DEFAULT_STATE), version: STATE_VERSION };
        }

        if (raw === null) {
            return { ...clone(DEFAULT_STATE), version: STATE_VERSION };
        }

        try {
            const saved = JSON.parse(raw);
            if (estadoValido(saved)) return saved;
        } catch (error) {
            console.warn('Estado local inválido:', error);
        }

        storageRecoveryWarning = 'Os dados salvos estão inválidos ou usam outra versão. Uma cópia de recuperação foi preservada. Confira os dados antes de continuar.';

        try {
            const backupExistente = localStorage.getItem(RECOVERY_KEY);
            if (backupExistente === null) {
                localStorage.setItem(RECOVERY_KEY, raw);
            } else {
                storageWriteBlocked = true;
                storageRecoveryWarning += ' Já existe uma cópia anterior; a gravação foi bloqueada para evitar sobrescrever dados.';
            }
        } catch (error) {
            storageWriteBlocked = true;
            storageRecoveryWarning += ' Não foi possível criar a cópia de segurança; a gravação foi bloqueada.';
            console.warn('Falha ao preservar os dados locais:', error);
        }

        return { ...clone(DEFAULT_STATE), version: STATE_VERSION };
    }

    let appState = loadState();
    let lastSavedState = clone(appState);

    // Sessão do administrador (some ao fechar a aba). Só Guto e Thiago têm acesso ao painel.
    function lerSessao() {
        try {
            const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
            return s && s.tipo === 'admin' && DEMO_ADMINS[s.usuario] ? { tipo: 'admin', usuario: s.usuario, nome: DEMO_ADMINS[s.usuario].nome } : null;
        } catch (error) {
            return null;
        }
    }
    function gravarSessao(conta) {
        try {
            if (conta && conta.tipo === 'admin') sessionStorage.setItem(SESSION_KEY, JSON.stringify(conta));
            else sessionStorage.removeItem(SESSION_KEY);
        } catch (error) { /* sessão só em memória */ }
    }

    let currentUser = lerSessao();
    let telaPendente = null;
    const isAdmin = () => Boolean(currentUser && currentUser.tipo === 'admin');
    const autor = () => (isAdmin() ? currentUser.nome : REGISTRADO_POR);
    let currentScreen = 'dashboard';
    let navigationHistory = [];

    function saveState() {
        if (storageWriteBlocked) {
            appState = clone(lastSavedState);
            return false;
        }

        try {
            const serialized = JSON.stringify(appState);
            localStorage.setItem(STORAGE_KEY, serialized);
            lastSavedState = clone(appState);
            return true;
        } catch (error) {
            appState = clone(lastSavedState);
            console.warn('Não foi possível salvar os dados neste navegador:', error);
            return false;
        }
    }

    function resetState() {
        appState = { ...clone(DEFAULT_STATE), version: STATE_VERSION };
        if (!saveState()) {
            renderAll();
            showAlert('dashboard', 'Não foi possível salvar a restauração. Os dados anteriores foram mantidos.', true);
            return;
        }
        renderAll();
    }

    /* ---------- regras de negócio (espelham as regras do banco) ---------- */

    const findPatrimonio = (codigo) => appState.patrimonios.find((p) => p.codigo === codigo);
    const countByResponsavel = (nome) => appState.patrimonios.filter((p) => p.responsavel === nome).length;
    const situacaoEstoque = (item) => (item.quantidade < item.minimo ? 'Estoque baixo' : 'Normal');
    const usuariosAtivos = () => appState.usuarios.filter((u) => u.status === 'Ativo');

    function resumoPatrimonios() {
        const conta = (status) => appState.patrimonios.filter((p) => p.status === status).length;
        return {
            total: appState.patrimonios.length,
            disponiveis: conta('Disponível'),
            cautelados: conta('Cautelado'),
            manutencao: conta('Manutenção'),
            baixados: conta('Baixado')
        };
    }

    function resumoEstoque(mesISO = hojeISO().slice(0, 7)) {
        const soma = (tipo) => appState.estoqueMovimentos
            .filter((m) => m.tipo === tipo && String(m.data).slice(0, 7) === mesISO)
            .reduce((total, m) => total + m.quantidade, 0);
        return {
            totalItens: appState.estoque.reduce((total, i) => total + i.quantidade, 0),
            entradasMes: soma('Entrada'),
            saidasMes: soma('Saída'),
            estoqueBaixo: appState.estoque.filter((i) => i.quantidade < i.minimo).length
        };
    }

    function cadastrarPatrimonioCore({ codigo, descricao, categoria, conservacao = 'Bom', dataCadastro }) {
        codigo = String(codigo || '').trim().toUpperCase();
        descricao = String(descricao || '').trim();
        categoria = String(categoria || '').trim();
        dataCadastro = dataCadastro || hojeISO();

        if (!/^PT-\d{4}$/.test(codigo)) return { ok: false, erro: 'Use o formato PT-0000 para o número do patrimônio.' };
        if (findPatrimonio(codigo)) return { ok: false, erro: `O patrimônio ${codigo} já está cadastrado.` };
        if (descricao.length < 3 || descricao.length > 150) return { ok: false, erro: 'A descricao deve ter entre 3 e 150 caracteres.' };
        if (!categoria) return { ok: false, erro: 'Selecione a categoria.' };
        if (!CONSERVACOES.includes(conservacao)) return { ok: false, erro: 'Estado de conservação inválido.' };
        if (!dataValida(dataCadastro)) return { ok: false, erro: 'Data de cadastro inválida.' };
        if (dataCadastro > hojeISO()) return { ok: false, erro: 'A data de cadastro não pode ser futura.' };

        appState.patrimonios.unshift({
            codigo, descricao, categoria, responsavel: SEM_RESPONSAVEL, status: 'Disponível', conservacao, dataCadastro
        });
        appState.movimentacoes.unshift({
            data: dataCadastro, patrimonio: codigo, acao: 'Cadastro', responsavel: SEM_RESPONSAVEL, registradoPor: autor()
        });
        return { ok: true, codigo };
    }

    function cadastrarUsuarioCore({ nome, departamento, matricula }) {
        nome = String(nome || '').trim();
        matricula = String(matricula || '').trim();

        if (nome.length < 3 || nome.length > 100) return { ok: false, erro: 'O nome deve ter entre 3 e 100 caracteres.' };
        if (!departamento) return { ok: false, erro: 'Selecione o departamento.' };
        if (!/^\d{6}$/.test(matricula)) return { ok: false, erro: 'A matrícula deve ter 6 dígitos.' };
        if (appState.usuarios.some((u) => norm(u.nome) === norm(nome))) return { ok: false, erro: `Já existe um usuário chamado ${nome}.` };
        if (appState.usuarios.some((u) => u.matricula === matricula)) return { ok: false, erro: `A matrícula ${matricula} já está em uso.` };

        appState.usuarios.push({ nome, departamento, matricula, status: 'Ativo' });
        return { ok: true, nome };
    }

    function registrarMovimentacaoCore({ patrimonio, acao, responsavel, data }) {
        const bem = findPatrimonio(patrimonio);
        data = data || hojeISO();

        if (!bem) return { ok: false, erro: 'Selecione um patrimônio.' };
        if (!ACOES.includes(acao)) return { ok: false, erro: 'Selecione a ação.' };
        if (!dataValida(data)) return { ok: false, erro: 'Data da movimentação inválida.' };
        if (bem.status === 'Baixado') return { ok: false, erro: `${bem.codigo} está baixado e não pode ser movimentado.` };
        if (data < bem.dataCadastro) return { ok: false, erro: 'A movimentação não pode ser anterior ao cadastro do patrimônio.' };

        const exigeResponsavel = acao === 'Cautela' || acao === 'Transferência';
        if (exigeResponsavel) {
            const pessoa = usuariosAtivos().find((u) => u.nome === responsavel);
            if (!pessoa) return { ok: false, erro: 'Selecione um responsável ativo.' };
        }

        if (acao === 'Cautela' && bem.status !== 'Disponível') return { ok: false, erro: 'A cautela exige um patrimônio disponível.' };
        if (acao === 'Transferência' && bem.status !== 'Cautelado') return { ok: false, erro: 'A transferência exige um patrimônio cautelado.' };
        if (acao === 'Transferência' && bem.responsavel === responsavel) return { ok: false, erro: 'O patrimônio já está com este responsável.' };
        if (acao === 'Devolução' && bem.status !== 'Cautelado' && bem.status !== 'Manutenção') {
            return { ok: false, erro: 'A devolução só vale para patrimônio cautelado ou em manutenção.' };
        }
        if (acao === 'Manutenção' && bem.status === 'Manutenção') return { ok: false, erro: 'O patrimônio já está em manutenção.' };

        if (exigeResponsavel) {
            bem.status = 'Cautelado';
            bem.responsavel = responsavel;
        } else {
            bem.status = { Devolução: 'Disponível', Manutenção: 'Manutenção', Baixa: 'Baixado' }[acao];
            bem.responsavel = SEM_RESPONSAVEL;
        }

        appState.movimentacoes.unshift({
            data, patrimonio: bem.codigo, acao,
            responsavel: exigeResponsavel ? responsavel : SEM_RESPONSAVEL,
            registradoPor: autor()
        });
        return { ok: true, status: bem.status };
    }

    function cadastrarProdutoCore({ produto, categoria, quantidade, minimo }) {
        produto = String(produto ?? '').trim();
        categoria = String(categoria ?? '').trim();
        quantidade = Number(quantidade);
        minimo = Number(minimo);

        if (produto.length < 2 || produto.length > 100)
            return { ok: false, erro: 'O nome deve ter entre 2 e 100 caracteres.' };
        if (categoria.length < 2 || categoria.length > 80)
            return { ok: false, erro: 'A categoria deve ter entre 2 e 80 caracteres.' };
        if (!Number.isInteger(quantidade) || quantidade < 0)
            return { ok: false, erro: 'A quantidade inicial deve ser um número inteiro igual ou maior que zero.' };
        if (!Number.isInteger(minimo) || minimo < 0)
            return { ok: false, erro: 'O estoque mínimo deve ser um número inteiro igual ou maior que zero.' };
        if (appState.estoque.some((i) => norm(i.produto) === norm(produto)))
            return { ok: false, erro: 'Já existe um produto com esse nome.' };

        appState.estoque.push({ produto, categoria, quantidade, minimo });
        return { ok: true };
    }

    function editarProdutoCore({ produtoAtual, produto, categoria, minimo }) {
        const item = appState.estoque.find((i) => norm(i.produto) === norm(produtoAtual));
        produto = String(produto ?? '').trim();
        categoria = String(categoria ?? '').trim();
        minimo = Number(minimo);

        if (!item) return { ok: false, erro: 'Produto não encontrado.' };
        if (produto.length < 2 || produto.length > 100)
            return { ok: false, erro: 'O nome deve ter entre 2 e 100 caracteres.' };
        if (categoria.length < 2 || categoria.length > 80)
            return { ok: false, erro: 'A categoria deve ter entre 2 e 80 caracteres.' };
        if (!Number.isInteger(minimo) || minimo < 0)
            return { ok: false, erro: 'O estoque mínimo deve ser um número inteiro igual ou maior que zero.' };
        if (appState.estoque.some((i) => i !== item && norm(i.produto) === norm(produto)))
            return { ok: false, erro: 'Já existe outro produto com esse nome.' };

        const nomeAnterior = item.produto;
        item.produto = produto;
        item.categoria = categoria;
        item.minimo = minimo;

        if (norm(nomeAnterior) !== norm(produto)) {
            appState.estoqueMovimentos.forEach((mov) => {
                if (norm(mov.produto) === norm(nomeAnterior)) mov.produto = produto;
            });
        }

        return { ok: true };
    }

    function excluirProdutoCore({ produto }) {
        const item = appState.estoque.find((i) => norm(i.produto) === norm(produto));
        if (!item) return { ok: false, erro: 'Produto não encontrado.' };

        if (appState.estoqueMovimentos.some((mov) => norm(mov.produto) === norm(item.produto)))
            return { ok: false, erro: 'Este produto possui movimentações no histórico e não pode ser excluído.' };

        appState.estoque = appState.estoque.filter((i) => i !== item);
        return { ok: true };
    }

    function registrarEstoqueCore({ produto, tipo, quantidade, data }) {
        const item = appState.estoque.find((i) => norm(i.produto) === norm(produto));
        quantidade = Number(quantidade);
        data = data || hojeISO();

        if (!item) return { ok: false, erro: 'Selecione um produto.' };
        if (tipo !== 'Entrada' && tipo !== 'Saída') return { ok: false, erro: 'Selecione entrada ou saída.' };
        if (!dataValida(data) || data > hojeISO()) return { ok: false, erro: 'Informe uma data válida, que não seja futura.' };
        if (!Number.isInteger(quantidade) || quantidade <= 0) return { ok: false, erro: 'Informe uma quantidade inteira maior que zero.' };
        if (tipo === 'Saída' && quantidade > item.quantidade) return { ok: false, erro: `Saída maior que o saldo (${item.quantidade}).` };

        item.quantidade += tipo === 'Entrada' ? quantidade : -quantidade;
        appState.estoqueMovimentos.unshift({ produto: item.produto, tipo, quantidade, data });
        return { ok: true, saldo: item.quantidade };
    }

    function patrimoniosDoCliente(cliente) {
        return cliente ? appState.patrimonios.filter((p) => p.responsavel === cliente.nome) : [];
    }

    function dataCautela(codigo, nome) {
        const mov = appState.movimentacoes.find((m) => m.patrimonio === codigo
            && m.responsavel === nome && (m.acao === 'Cautela' || m.acao === 'Transferência'));
        return mov ? mov.data : '';
    }

    function movimentacoesDoCliente(cliente) {
        if (!cliente) return [];
        return appState.movimentacoes.filter((m) => m.responsavel === cliente.nome);
    }

    /* ---------- renderização ---------- */

    function getStatusBadge(status) {
        const map = {
            'Disponível': 'available', 'Cautelado': 'cautioned', 'Manutenção': 'maintenance', 'Baixado': 'maintenance',
            'Ativo': 'available', 'Inativo': 'maintenance', 'Estoque baixo': 'maintenance', 'Normal': 'available',
            'Em uso': 'cautioned', 'Devolvido': 'available'
        };
        return map[status] || 'available';
    }

    const badge = (status) => `<span class="status ${getStatusBadge(status)}">${esc(status)}</span>`;
    const setRows = (tbody, rows, colspan) => {
        if (!tbody) return;
        tbody.innerHTML = rows.length
            ? rows.join('')
            : `<tr><td colspan="${colspan}" style="text-align:center;color:#68778d">Nenhum registro.</td></tr>`;
    };

    function renderPatrimonios() {
        setRows($('#patrimonioTable'), appState.patrimonios.map((item) => `
            <tr><td>${esc(item.codigo)}</td><td>${esc(item.descricao)}</td><td>${esc(item.categoria)}</td>
            <td>${esc(item.responsavel || SEM_RESPONSAVEL)}</td><td>${badge(item.status)}</td></tr>`), 5);
    }

    function renderUsuarios() {
        setRows($('#usuarios tbody'), appState.usuarios.map((u) => `
            <tr><td>${esc(u.nome)}</td><td>${esc(u.departamento)}</td><td>${countByResponsavel(u.nome)}</td>
            <td>${badge(u.status)}</td></tr>`), 4);
    }

    function renderEstoque() {
        const cabecalho = $('#estoque thead tr');
        if (cabecalho && !cabecalho.querySelector('[data-product-actions]')) {
            const th = document.createElement('th');
            th.textContent = 'Ações';
            th.setAttribute('data-product-actions', '');
            cabecalho.appendChild(th);
        }

        setRows($('#estoque tbody'), appState.estoque.map((i) => `
            <tr>
                <td>${esc(i.produto)}</td><td>${esc(i.categoria)}</td>
                <td>${i.quantidade}</td><td>${i.minimo}</td>
                <td>${badge(situacaoEstoque(i))}</td>
                <td>
                    <button type="button" class="action-button" data-product-action="edit" data-product="${esc(i.produto)}">Editar</button>
                    <button type="button" class="action-button" data-product-action="delete" data-product="${esc(i.produto)}">Excluir</button>
                </td>
            </tr>`), 6);

        const alertas = $('#estoqueAlertas');
        if (alertas) {
            const produtosBaixos = appState.estoque.filter(
                (item) => Number(item.quantidade) < Number(item.minimo)
            );

            alertas.innerHTML = produtosBaixos.length
                ? `<strong>Atenção: ${produtosBaixos.length} produto(s) abaixo do estoque mínimo.</strong>
                   <ul>${produtosBaixos.map((item) =>
                       `<li>${esc(item.produto)} — atual: ${Number(item.quantidade).toLocaleString('pt-BR')}; mínimo: ${Number(item.minimo).toLocaleString('pt-BR')}</li>`
                   ).join('')}</ul>`
                : '';

            alertas.style.display = produtosBaixos.length ? 'block' : 'none';
        }
        const valores = $$('#estoque .stat-card strong');
        const r = resumoEstoque();
        const dados = [r.totalItens, r.entradasMes, r.saidasMes, r.estoqueBaixo];
        valores.forEach((el, index) => { if (index < dados.length) el.textContent = dados[index].toLocaleString('pt-BR'); });
    }

    function renderMovimentacoes() {
        setRows($('#movimentacoes tbody'), appState.movimentacoes.map((m) => `
            <tr><td>${toBR(m.data)}</td><td>${esc(m.patrimonio)}</td><td>${esc(m.acao)}</td>
            <td>${esc(m.responsavel || SEM_RESPONSAVEL)}</td><td>${esc(m.registradoPor)}</td></tr>`), 5);
    }

    function renderEstoqueMovimentos() {
        const movimentos = [...appState.estoqueMovimentos]
            .sort((a, b) => String(b.data).localeCompare(String(a.data)));

        setRows($('#estoqueMovimentosTable'), movimentos.map((m) => `
            <tr>
                <td>${toBR(m.data)}</td>
                <td>${esc(m.produto)}</td>
                <td><span class="status ${m.tipo === 'Entrada' ? 'available' : 'maintenance'}">${esc(m.tipo)}</span></td>
                <td>${Number(m.quantidade).toLocaleString('pt-BR')}</td>
            </tr>`), 4);
    }

    function renderLanding() {
        const r = resumoPatrimonios();
        const campos = { liveTotal: r.total, liveCautelados: r.cautelados, liveDisponiveis: r.disponiveis, liveManutencao: r.manutencao };
        Object.keys(campos).forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = campos[id];
        });
    }

    function renderDashboardTotals() {
        const r = resumoPatrimonios();
        const dados = [r.total, r.disponiveis, r.cautelados, r.manutencao];

        $$('#dashboard .stat-card strong').forEach((el, index) => {
            if (index < dados.length) el.textContent = dados[index];
        });

        const estoque = resumoEstoque();
        const totalProdutos = document.getElementById('dashboardTotalProdutos');
        const estoqueBaixo = document.getElementById('dashboardEstoqueBaixo');

        if (totalProdutos) totalProdutos.textContent = appState.estoque.length;
        if (estoqueBaixo) estoqueBaixo.textContent = estoque.estoqueBaixo;
    }

    function renderClientPortal() {
        const cliente = currentUser && currentUser.tipo === 'cliente' ? currentUser : null;
        const nome = cliente ? cliente.nome : '';
        if (!cliente) return;

        const nameEl = $('#client-portal strong');
        if (nameEl) nameEl.textContent = nome;
        const top = $('.client-top-user');
        if (top) top.textContent = `${nome} · Cliente`;
        const welcome = $('#client-dashboard h1');
        if (welcome) welcome.textContent = `Olá, ${nome}.`;

        const meus = patrimoniosDoCliente(cliente);
        const r = resumoPatrimonios();
        const stats = $$('#client-dashboard .client-stat strong');
        [meus.length, r.disponiveis, r.manutencao].forEach((v, i) => { if (stats[i]) stats[i].textContent = v; });

        const linhaResumo = (p) => `<tr><td>${esc(p.codigo)}</td><td>${esc(p.descricao)}</td><td>${esc(p.categoria)}</td><td>${badge('Em uso')}</td></tr>`;
        setRows($('#client-dashboard tbody'), meus.slice(0, 3).map(linhaResumo), 4);

        setRows($('#client-patrimonios tbody'), meus.map((p) => `
            <tr><td>${esc(p.codigo)}</td><td>${esc(p.descricao)}</td><td>${esc(p.categoria)}</td>
            <td>${toBR(dataCautela(p.codigo, nome))}</td><td>${badge('Em uso')}</td></tr>`), 5);

        const codigosMeus = new Set(meus.map((p) => p.codigo));
        setRows($('#client-movimentacoes tbody'), movimentacoesDoCliente(cliente).map((m) => `
            <tr><td>${toBR(m.data)}</td><td>${esc(m.patrimonio)}</td><td>${esc(m.acao)}</td>
            <td>${badge(codigosMeus.has(m.patrimonio) ? 'Em uso' : 'Devolvido')}</td></tr>`), 4);
    }

    function syncDateField() {
        const field = document.getElementById('dataCadastro');
        if (!field) return;
        field.max = hojeISO();
        if (!field.value) field.value = hojeISO();
    }

    function setSelectOptions(select, options, placeholder) {
        if (!select) return;
        const atual = select.value;
        select.innerHTML = (placeholder ? `<option value="">${esc(placeholder)}</option>` : '')
            + options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
        if (options.includes(atual)) select.value = atual;
    }

    function renderForms() {
        setSelectOptions(document.getElementById('movPatrimonio'),
            appState.patrimonios.filter((p) => p.status !== 'Baixado').map((p) => p.codigo), 'Selecione');
        setSelectOptions(document.getElementById('movResponsavel'), usuariosAtivos().map((u) => u.nome), 'Selecione');
        setSelectOptions(document.getElementById('estProduto'), appState.estoque.map((i) => i.produto), 'Selecione');
        toggleResponsavel();
    }

    function renderAll() {
        renderPatrimonios();
        renderUsuarios();
        renderEstoque();
        renderMovimentacoes();
        renderEstoqueMovimentos();
        renderDashboardTotals();
        renderLanding();
        renderClientPortal();
        renderForms();
        syncDateField();
    }

    /* ---------- avisos ---------- */

    function showAlert(sectionId, message, erro = false) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        let box = $('.alert.js-alert', section);
        if (!box) {
            box = document.createElement('div');
            box.className = 'alert js-alert';
            box.setAttribute('role', 'status');
            const header = $('.page-header', section);
            if (header) header.after(box); else section.prepend(box);
        }
        box.textContent = message;
        box.style.background = erro ? '#fdecea' : '#e7f6ed';
        box.style.color = erro ? '#8e2b20' : '#11653e';
        box.style.display = 'block';
        clearTimeout(box._timer);
        box._timer = setTimeout(() => { box.style.display = 'none'; }, 4000);
    }

    /* ---------- navegação ---------- */

    function setDisplay(ids, active) {
        ['landing', 'app', 'client-login', 'client-portal'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = id === active ? 'block' : 'none';
        });
    }

    function scrollTop() {
        if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    }

    function showScreen(screen) {
        $$('.page').forEach((page) => page.classList.remove('active'));
        const target = document.getElementById(screen);
        if (target) target.classList.add('active');
        $$('.menu-button').forEach((button) => button.classList.toggle('active', button.dataset.screen === screen));
        scrollTop();
    }

    // Painel administrativo: exige login de administrador
    function openApp(tela = 'dashboard') {
        if (!isAdmin()) {
            telaPendente = tela;
            openClientLogin();
            return;
        }
        abrirPainel();
        if (tela !== 'dashboard') navigate(tela);
    }

    function abrirPainel() {
        const nome = document.getElementById('adminNome');
        if (nome) nome.textContent = `${currentUser.nome} · Administrador`;
        setDisplay(null, 'app');
        navigationHistory = [];
        currentScreen = 'dashboard';
        showScreen('dashboard');
    }

    function navigate(screen) {
        if (!screen || screen === currentScreen) return;
        navigationHistory.push(currentScreen);
        currentScreen = screen;
        showScreen(screen);
    }

    // Troca de tela sem deixar o formulário concluído no histórico
    function replaceWith(screen) {
        if (navigationHistory[navigationHistory.length - 1] === screen) navigationHistory.pop();
        currentScreen = screen;
        showScreen(screen);
    }

    function goBack() {
        if (navigationHistory.length === 0) {
            setDisplay(null, 'landing');
            scrollTop();
            return;
        }
        currentScreen = navigationHistory.pop();
        showScreen(currentScreen);
    }

    function openClientLogin() {
        setDisplay(null, 'client-login');
        ['loginUsuario', 'loginSenha'].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ''; });
        const erro = document.getElementById('loginError');
        if (erro) erro.style.display = 'none';
        scrollTop();
    }

    function backToLanding() {
        setDisplay(null, 'landing');
        scrollTop();
    }

    function showClientScreen(screen) {
        $$('.client-page').forEach((page) => page.classList.remove('active'));
        const target = document.getElementById(screen);
        if (target) target.classList.add('active');
        $$('.client-menu').forEach((button) => button.classList.toggle('active', button.dataset.clientScreen === screen));
        scrollTop();
    }

    function autenticar(usuario, senha) {
        usuario = norm(usuario);
        const admin = DEMO_ADMINS[usuario];
        if (admin && admin.senha === senha) return { tipo: 'admin', nome: admin.nome, usuario };
        const cliente = appState.clientes.find((c) => c.usuario === usuario);
        if (cliente && DEMO_CLIENT_PASSWORDS[usuario] === senha) return { ...cliente, tipo: 'cliente' };
        return null;
    }

    function loginCliente(event) {
        event.preventDefault();
        const usuario = document.getElementById('loginUsuario').value;
        const senha = document.getElementById('loginSenha').value;
        const erro = document.getElementById('loginError');
        const conta = autenticar(usuario, senha);

        if (!conta) {
            if (erro) erro.style.display = 'block';
            return;
        }
        if (erro) erro.style.display = 'none';
        currentUser = conta;
        gravarSessao(conta);

        if (conta.tipo === 'admin') {
            const destino = telaPendente || 'dashboard';
            telaPendente = null;
            openApp(destino);
            return;
        }
        setDisplay(null, 'client-portal');
        showClientScreen('client-dashboard');
        renderClientPortal();
        scrollTop();
    }

    function logoutCliente() {
        currentUser = null;
        telaPendente = null;
        gravarSessao(null);
        ['loginUsuario', 'loginSenha'].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ''; });
        backToLanding();
    }

    /* ---------- formulários ---------- */

    function cadastrarPatrimonio(event) {
        event.preventDefault();
        if (!event.target.checkValidity()) {
            event.target.reportValidity();
            return;
        }
        const val = (id) => (document.getElementById(id) ? document.getElementById(id).value : '');
        const resultado = cadastrarPatrimonioCore({
            codigo: val('numeroPatrimonio'),
            descricao: val('descricaoPatrimonio'),
            categoria: val('categoriaPatrimonio'),
            conservacao: val('conservacaoPatrimonio') || 'Bom',
            dataCadastro: val('dataCadastro')
        });

        if (!resultado.ok) {
            showAlert('cadastro-patrimonio', resultado.erro, true);
            return;
        }
        if (!saveState()) {
            renderAll();
            showAlert('cadastro-patrimonio', 'Não foi possível salvar. A alteração foi desfeita.', true);
            return;
        }
        renderAll();
        event.target.reset();
        syncDateField();
        replaceWith('patrimonios');
        showAlert('patrimonios', `Patrimônio ${resultado.codigo} cadastrado com sucesso.`);
    }

    function cadastrarUsuario(event) {
        event.preventDefault();
        if (!event.target.checkValidity()) {
            event.target.reportValidity();
            return;
        }
        const val = (id) => (document.getElementById(id) ? document.getElementById(id).value : '');
        const resultado = cadastrarUsuarioCore({
            nome: val('nomeUsuario'),
            departamento: val('departamentoUsuario'),
            matricula: val('matriculaUsuario')
        });

        if (!resultado.ok) {
            showAlert('cadastro-usuario', resultado.erro, true);
            return;
        }
        if (!saveState()) {
            renderAll();
            showAlert('cadastro-usuario', 'Não foi possível salvar. A alteração foi desfeita.', true);
            return;
        }
        renderAll();
        event.target.reset();
        replaceWith('usuarios');
        showAlert('usuarios', `Usuário ${resultado.nome} cadastrado com sucesso.`);
    }

    function toggleResponsavel() {
        const acao = document.getElementById('movAcao');
        const campo = document.getElementById('movResponsavelCampo');
        if (!acao || !campo) return;
        campo.style.display = acao.value === 'Cautela' || acao.value === 'Transferência' ? '' : 'none';
    }

    function injetarFormularios() {
        const movs = document.getElementById('movimentacoes');
        const boxMov = movs && $('.content-box', movs);
        if (boxMov && !document.getElementById('formMovimentacao')) {
            const wrap = document.createElement('div');
            wrap.className = 'content-box';
            wrap.style.cssText = 'padding:24px;margin-bottom:24px';
            wrap.innerHTML = `
                <div class="box-header"><h3>Registrar movimentação</h3></div>
                <form id="formMovimentacao" novalidate>
                    <div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
                        <div class="field"><label for="movPatrimonio">Patrimônio</label><select id="movPatrimonio" required></select></div>
                        <div class="field"><label for="movAcao">Ação</label>
                            <select id="movAcao" required>${ACOES.map((a) => `<option>${a}</option>`).join('')}</select></div>
                        <div class="field" id="movResponsavelCampo"><label for="movResponsavel">Responsável</label><select id="movResponsavel"></select></div>
                    </div>
                    <div class="form-actions" style="margin-top:16px"><button type="submit" class="action-button">Registrar</button></div>
                </form>`;
            boxMov.before(wrap);
            document.getElementById('movAcao').addEventListener('change', toggleResponsavel);
            document.getElementById('formMovimentacao').addEventListener('submit', (event) => {
                event.preventDefault();
                const resultado = registrarMovimentacaoCore({
                    patrimonio: document.getElementById('movPatrimonio').value,
                    acao: document.getElementById('movAcao').value,
                    responsavel: document.getElementById('movResponsavel').value
                });
                if (!resultado.ok) { showAlert('movimentacoes', resultado.erro, true); return; }
                if (!saveState()) {
                    renderAll();
                    showAlert('movimentacoes', 'Não foi possível salvar. A movimentação foi desfeita.', true);
                    return;
                }
                renderAll();
                showAlert('movimentacoes', `Movimentação registrada. Novo status: ${resultado.status}.`);
            });
        }

        const est = document.getElementById('estoque');
        const boxEst = est && $('.content-box', est);
        if (boxEst && !document.getElementById('formProduto')) {
            const wrapProduto = document.createElement('div');
            wrapProduto.className = 'content-box';
            wrapProduto.style.cssText = 'padding:24px;margin-bottom:24px';
            wrapProduto.innerHTML = `
                <div class="box-header"><h3 id="tituloFormProduto">Cadastrar produto</h3></div>
                <form id="formProduto" novalidate>
                    <input type="hidden" id="produtoOriginal">
                    <div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
                        <div class="field">
                            <label for="produtoNome">Nome do produto</label>
                            <input id="produtoNome" type="text" minlength="2" maxlength="100" required>
                        </div>
                        <div class="field">
                            <label for="produtoCategoria">Categoria</label>
                            <input id="produtoCategoria" type="text" minlength="2" maxlength="80" required>
                        </div>
                        <div class="field">
                            <label for="produtoQuantidade">Quantidade inicial</label>
                            <input id="produtoQuantidade" type="number" min="0" step="1" value="0" required>
                        </div>
                        <div class="field">
                            <label for="produtoMinimo">Estoque mínimo</label>
                            <input id="produtoMinimo" type="number" min="0" step="1" value="0" required>
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
                        <button type="submit" class="action-button" id="produtoSalvar">Cadastrar produto</button>
                        <button type="button" class="action-button" id="produtoCancelar" hidden>Cancelar edição</button>
                    </div>
                </form>`;
            boxEst.before(wrapProduto);

            const formProduto = document.getElementById('formProduto');
            const campoOriginal = document.getElementById('produtoOriginal');

            function limparEdicaoProduto() {
                formProduto.reset();
                campoOriginal.value = '';
                document.getElementById('produtoQuantidade').value = '0';
                document.getElementById('produtoQuantidade').readOnly = false;
                document.querySelector('label[for="produtoQuantidade"]').textContent = 'Quantidade inicial';
                document.getElementById('produtoMinimo').value = '0';
                document.getElementById('tituloFormProduto').textContent = 'Cadastrar produto';
                document.getElementById('produtoSalvar').textContent = 'Cadastrar produto';
                document.getElementById('produtoCancelar').hidden = true;
            }

            document.getElementById('produtoCancelar').addEventListener('click', limparEdicaoProduto);

            formProduto.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!formProduto.checkValidity()) {
                    formProduto.reportValidity();
                    return;
                }

                const dados = {
                    produto: document.getElementById('produtoNome').value,
                    categoria: document.getElementById('produtoCategoria').value,
                    quantidade: document.getElementById('produtoQuantidade').value,
                    minimo: document.getElementById('produtoMinimo').value
                };

                const original = campoOriginal.value;
                const resultado = original
                    ? editarProdutoCore({ ...dados, produtoAtual: original })
                    : cadastrarProdutoCore(dados);

                if (!resultado.ok) {
                    showAlert('estoque', resultado.erro, true);
                    return;
                }

                if (!saveState()) {
                    renderAll();
                    showAlert('estoque', 'Não foi possível salvar. A alteração do produto foi desfeita.', true);
                    return;
                }
                limparEdicaoProduto();
                renderAll();
                showAlert('estoque', original ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
            });

            const tabelaEstoque = $('#estoque tbody');
            if (tabelaEstoque && !tabelaEstoque.dataset.productActionsBound) {
                tabelaEstoque.dataset.productActionsBound = 'true';
                tabelaEstoque.addEventListener('click', (event) => {
                    const botao = event.target.closest('[data-product-action]');
                    if (!botao) return;

                    const produto = botao.getAttribute('data-product');
                    const acao = botao.getAttribute('data-product-action');

                    if (acao === 'edit') {
                        const item = appState.estoque.find((i) => norm(i.produto) === norm(produto));
                        if (!item) return;

                        campoOriginal.value = item.produto;
                        document.getElementById('produtoNome').value = item.produto;
                        document.getElementById('produtoCategoria').value = item.categoria;
                        document.getElementById('produtoQuantidade').value = item.quantidade;
                        document.getElementById('produtoQuantidade').readOnly = true;
                        document.querySelector('label[for="produtoQuantidade"]').textContent = 'Quantidade atual (somente leitura)';
                        document.getElementById('produtoMinimo').value = item.minimo;
                        document.getElementById('tituloFormProduto').textContent = 'Editar produto';
                        document.getElementById('produtoSalvar').textContent = 'Salvar alterações';
                        document.getElementById('produtoCancelar').hidden = false;
                        formProduto.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        document.getElementById('produtoNome').focus();
                        return;
                    }

                    if (acao === 'delete') {
                        if (!window.confirm(`Deseja excluir o produto "${produto}"?`)) return;

                        const resultado = excluirProdutoCore({ produto });
                        if (!resultado.ok) {
                            showAlert('estoque', resultado.erro, true);
                            return;
                        }

                        if (!saveState()) {
                            renderAll();
                            showAlert('estoque', 'Não foi possível salvar. A exclusão foi desfeita.', true);
                            return;
                        }
                        renderAll();
                        showAlert('estoque', 'Produto excluído com sucesso.');
                    }
                });
            }
        }

        if (boxEst && !document.getElementById('formEstoque')) {
            const wrap = document.createElement('div');
            wrap.className = 'content-box';
            wrap.style.cssText = 'padding:24px;margin-bottom:24px';
            wrap.innerHTML = `
                <div class="box-header"><h3>Registrar entrada ou saída</h3></div>
                <form id="formEstoque" novalidate>
                    <div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
                        <div class="field"><label for="estProduto">Produto</label><select id="estProduto" required></select></div>
                        <div class="field"><label for="estTipo">Tipo</label>
                            <select id="estTipo" required><option>Entrada</option><option>Saída</option></select></div>
                        <div class="field"><label for="estQuantidade">Quantidade</label>
                            <input id="estQuantidade" type="number" min="1" step="1" required></div>
                        <div class="field"><label for="estData">Data da movimentação</label>
                            <input id="estData" type="date" required max="${hojeISO()}" value="${hojeISO()}"></div>
                    </div>
                    <div class="form-actions" style="margin-top:16px"><button type="submit" class="action-button">Registrar</button></div>
                </form>`;
            boxEst.before(wrap);
            document.getElementById('formEstoque').addEventListener('submit', (event) => {
                event.preventDefault();
                const formulario = document.getElementById('formEstoque');
                if (!formulario.checkValidity()) {
                    formulario.reportValidity();
                    return;
                }
                const resultado = registrarEstoqueCore({
                    produto: document.getElementById('estProduto').value,
                    tipo: document.getElementById('estTipo').value,
                    quantidade: document.getElementById('estQuantidade').value,
                    data: document.getElementById('estData').value
                });
                if (!resultado.ok) { showAlert('estoque', resultado.erro, true); return; }
                if (!saveState()) {
                    renderAll();
                    showAlert('estoque', 'Não foi possível salvar. A movimentação de estoque foi desfeita.', true);
                    return;
                }
                document.getElementById('estQuantidade').value = '';
                document.getElementById('estData').value = hojeISO();
                renderAll();
                showAlert('estoque', `Movimento registrado. Saldo atual: ${resultado.saldo}.`);
            });
        }
    }

    function ligarRotulos() {
        $$('.field').forEach((field) => {
            const label = $('label', field);
            const control = $('input, select, textarea', field);
            if (label && control && control.id && !label.htmlFor) label.htmlFor = control.id;
        });
        const codigo = document.getElementById('numeroPatrimonio');
        if (codigo) codigo.addEventListener('input', () => { codigo.value = codigo.value.toUpperCase(); });
    }

    const LANDING_ANCHORS = ['produto', 'como-funciona', 'sobre', 'equipe'];

    function routeFromHash() {
        const hash = (window.location && window.location.hash ? window.location.hash : '').slice(1);
        if (APP_SCREENS.includes(hash)) {
            openApp(hash);
        } else if (hash === 'login') {
            openClientLogin();
        } else if (LANDING_ANCHORS.includes(hash)) {
            const landing = document.getElementById('landing');
            if (landing && landing.style.display === 'none') setDisplay(null, 'landing');
            const alvo = document.getElementById(hash);
            if (alvo && typeof alvo.scrollIntoView === 'function') alvo.scrollIntoView();
        }
    }

    function ligarMenuMovel() {
        const botao = document.getElementById('menuToggle');
        const nav = document.getElementById('siteNav');
        if (!botao || !nav) return;

        const alternar = (aberto) => {
            nav.classList.toggle('open', aberto);
            botao.setAttribute('aria-expanded', String(aberto));
            botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        };

        botao.addEventListener('click', () => {
            alternar(!nav.classList.contains('open'));
        });

        nav.addEventListener('click', (event) => {
            if (event.target.closest('a, button')) alternar(false);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && nav.classList.contains('open')) {
                alternar(false);
                botao.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) alternar(false);
        });
    }

    function bootstrap() {
        Object.assign(window, {
            openApp, navigate, goBack, showScreen, loginCliente, showClientScreen, logoutCliente,
            logoutAdmin: logoutCliente, backToLanding, cadastrarPatrimonio, cadastrarUsuario, openClientLogin
        });
        injetarFormularios();
        ligarRotulos();
        ligarMenuMovel();
        renderAll();
        if (storageRecoveryWarning) {
            showAlert('dashboard', storageRecoveryWarning, true);
        }
        routeFromHash();
        if (typeof window.addEventListener === 'function') window.addEventListener('hashchange', routeFromHash);
        window.StockFlow = {
            core: { cadastrarPatrimonioCore, cadastrarUsuarioCore, cadastrarProdutoCore, editarProdutoCore, excluirProdutoCore, registrarMovimentacaoCore, registrarEstoqueCore,
                    resumoPatrimonios, resumoEstoque, autenticar, patrimoniosDoCliente, dataCautela, esc, toBR },
            getState: () => appState,
            setCurrentUser: (conta) => { currentUser = conta; },
            resetState
        };
    }

    bootstrap();
})();
