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
        currentUser: null
    };

    let appState = loadState();
    let currentScreen = 'dashboard';
    let navigationHistory = [];

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && Array.isArray(saved.patrimonios)) {
                return { ...JSON.parse(JSON.stringify(defaultState)), ...saved };
            }
        } catch (error) {
            console.warn('Estado local não carregado:', error);
        }

        return JSON.parse(JSON.stringify(defaultState));
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
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
        return appState.currentUser && appState.currentUser.tipo === 'admin';
    }

    function excluirPatrimonio(codigo) {
        if (!isAdmin()) {
            alert('Acesso negado. Apenas o Administrador pode excluir patrimónios.');
            return;
        }
        if (!confirm(`Tem certeza que deseja excluir o patrimônio ${codigo}?`)) return;
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

    function renderPatrimonios() {
        const table = document.getElementById('patrimonioTable');
        if (!table) return;

        const admin = isAdmin();

        table.innerHTML = appState.patrimonios.map((item) => `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${item.categoria}</td>
                <td>${item.responsavel || '—'}</td>
                <td>
                    <span class="status ${getStatusBadge(item.status)}">${item.status}</span>
                </td>
                <td>
                    ${admin ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="excluirPatrimonio('${item.codigo}')">Excluir</button>` : '<span style="color: var(--text-muted); font-size: 12px;">Restrito</span>'}
                </td>
            </tr>
        `).join('');
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
        const dashboardValues = [
            document.querySelectorAll('.stat-card strong')[0],
            document.querySelectorAll('.stat-card strong')[1],
            document.querySelectorAll('.stat-card strong')[2],
            document.querySelectorAll('.stat-card strong')[3]
        ];

        if (appState.currentUser && appState.currentUser.tipo !== 'admin') {
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

    function showScreen(screen) {
        const pages = document.querySelectorAll('.page');
        pages.forEach((page) => page.classList.remove('active'));

        const target = document.getElementById(screen);
        if (target) target.classList.add('active');

        document.querySelectorAll('.menu-button').forEach((button) => {
            button.classList.toggle('active', button.dataset.screen === screen);
        });

        if (screen === 'nova-movimentacao') {
            carregarSelectsMovimentacao();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function navigate(screen) {
        if (!screen) return;
        navigationHistory.push(currentScreen);
        currentScreen = screen;
        showScreen(screen);
    }

    function goBack() {
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

    function loginCliente(event) {
        event.preventDefault();

        const usuario = document.getElementById('loginUsuario').value.trim().toLowerCase();
        const senha = document.getElementById('loginSenha').value;
        const erro = document.getElementById('loginError');

        const validAdmin = usuario === 'admin' && senha === 'admin';
        const validClient = appState.clientes.some((cliente) => cliente.usuario === usuario && cliente.senha === senha);

        if (!validAdmin && !validClient) {
            if (erro) erro.style.display = 'block';
            return;
        }

        appState.currentUser = validAdmin
            ? { nome: 'Administrador', tipo: 'admin', usuario: 'admin' }
            : appState.clientes.find((cliente) => cliente.usuario === usuario);

        const clientLogin = document.getElementById('client-login');
        const clientPortal = document.getElementById('client-portal');
        const landing = document.getElementById('landing');
        const app = document.getElementById('app');

        if (validAdmin) {
            if (clientLogin) clientLogin.style.display = 'none';
            if (landing) landing.style.display = 'none';
            if (clientPortal) clientPortal.style.display = 'none';
            openApp();
            return;
        }

        if (clientLogin) clientLogin.style.display = 'none';
        if (landing) clientLogin.style.display = 'none';
        if (app) app.style.display = 'none';
        if (clientPortal) clientPortal.style.display = 'block';

        if (erro) erro.style.display = 'none';
        showClientScreen('client-dashboard');
        renderAll();
        window.scrollTo(0, 0);
    }

    function logoutCliente() {
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

        const dataAtual = new Date().toLocaleDateString('pt-BR');

        appState.movimentacoes.unshift({
            data: dataAtual,
            patrimonio: patId,
            acao: 'Cautela',
            responsavel: userName,
            registradoPor: 'Administrador'
        });

        const patObj = appState.patrimonios.find(p => p.codigo === patId);
        if (patObj) {
            patObj.responsavel = userName;
            patObj.status = 'Cautelado';
        }

        saveState();
        renderAll();

        alert('Movimentação registrada com sucesso!');
        navigate('movimentacoes');
    }

    function cadastrarPatrimonio(event) {
        event.preventDefault();

        const codigo = document.getElementById('numeroPatrimonio').value.trim();
        const descricao = document.getElementById('descricaoPatrimonio').value.trim();
        const categoria = document.getElementById('categoriaPatrimonio').value.trim();

        if (!codigo || !descricao || !categoria) return;

        const novoPatrimonio = {
            codigo,
            descricao,
            categoria,
            responsavel: '—',
            status: 'Disponível',
            dataCadastro: document.getElementById('dataCadastro')?.value || new Date().toISOString().split('T')[0],
            conservacao: 'Bom'
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

        event.target.reset();
        syncDateField();

        const alertBox = document.getElementById('patrimonioAlert');
        if (alertBox) {
            alertBox.style.display = 'block';
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 3000);
        }

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

        window.openApp = openApp;
        window.navigate = navigate;
        window.goBack = goBack;
        window.showScreen = showScreen;
        window.loginCliente = loginCliente;
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
        window.toggleLandingNav = toggleLandingNav;
        window.closeLandingNav = closeLandingNav;
        window.toggleAdminSidebar = toggleAdminSidebar;
        window.toggleClientSidebar = toggleClientSidebar;
        window.closeAllSidebars = closeAllSidebars;
    }

    bootstrap();
})();
