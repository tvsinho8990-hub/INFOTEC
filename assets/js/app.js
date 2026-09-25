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
                responsavel: 'Maria Souza',
                status: 'Cautelado',
                dataCadastro: '2026-09-04',
                conservacao: 'Regular'
            },
            {
                codigo: 'PT-0004',
                descricao: 'Computador Desktop',
                categoria: 'Informática',
                responsavel: '—',
                status: 'Manutenção',
                dataCadastro: '2026-09-05',
                conservacao: 'Necessita manutenção'
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
                nome: 'Maria Souza',
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
                data: '04/09/2026',
                patrimonio: 'PT-0001',
                acao: 'Cautela',
                responsavel: 'João Silva',
                registradoPor: 'Administrador'
            },
            {
                data: '03/09/2026',
                patrimonio: 'PT-0003',
                acao: 'Transferência',
                responsavel: 'Maria Souza',
                registradoPor: 'Administrador'
            },
            {
                data: '02/09/2026',
                patrimonio: 'PT-0004',
                acao: 'Manutenção',
                responsavel: '—',
                registradoPor: 'Administrador'
            },
            {
                data: '01/09/2026',
                patrimonio: 'PT-0002',
                acao: 'Devolução',
                responsavel: '—',
                registradoPor: 'Administrador'
            }
        ],
        clientes: [
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

    function renderPatrimonios() {
        const table = document.getElementById('patrimonioTable');
        if (!table) return;

        table.innerHTML = appState.patrimonios.map((item) => `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${item.categoria}</td>
                <td>${item.responsavel || '—'}</td>
                <td>
                    <span class="status ${getStatusBadge(item.status)}">${item.status}</span>
                </td>
            </tr>
        `).join('');
    }

    function renderUsuarios() {
        const table = document.querySelector('#usuarios tbody');
        if (!table) return;

        table.innerHTML = appState.usuarios.map((usuario) => `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.departamento}</td>
                <td>${usuario.patrimonioCount}</td>
                <td>
                    <span class="status ${getStatusBadge(usuario.status)}">${usuario.status}</span>
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
            clientName.textContent = appState.currentUser?.nome || 'Anderson';
        }

        const clientTopUser = document.querySelector('.client-top-user');
        if (clientTopUser) {
            clientTopUser.textContent = `${appState.currentUser?.nome || 'Anderson'} · Cliente`;
        }

        const clientWelcome = document.querySelector('#client-dashboard h1');
        if (clientWelcome && appState.currentUser?.nome) {
            clientWelcome.textContent = `Olá, ${appState.currentUser.nome}.`;
        }
    }

    function renderDashboardTotals() {
        const totalPatrimonios = appState.patrimonios.length;
        const disponiveis = appState.patrimonios.filter((item) => item.status === 'Disponível').length;
        const cautelados = appState.patrimonios.filter((item) => item.status === 'Cautelado').length;
        const manutencao = appState.patrimonios.filter((item) => item.status === 'Manutenção').length;

        const dashboardValues = [
            document.querySelectorAll('.stat-card strong')[0],
            document.querySelectorAll('.stat-card strong')[1],
            document.querySelectorAll('.stat-card strong')[2],
            document.querySelectorAll('.stat-card strong')[3]
        ];

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
        renderDashboardTotals();
        renderClientPortal();
        syncDateField();
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
    }

    function showScreen(screen) {
        const pages = document.querySelectorAll('.page');
        pages.forEach((page) => page.classList.remove('active'));

        const target = document.getElementById(screen);
        if (target) target.classList.add('active');

        document.querySelectorAll('.menu-button').forEach((button) => {
            button.classList.toggle('active', button.dataset.screen === screen);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function navigate(screen) {
        if (!screen || screen === currentScreen) return;
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

        if (clientLogin) clientLogin.style.display = 'none';
        if (landing) landing.style.display = 'none';
        if (app) app.style.display = 'none';
        if (clientPortal) clientPortal.style.display = 'block';

        if (erro) erro.style.display = 'none';
        showClientScreen('client-dashboard');
        renderClientPortal();
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

    function bootstrap() {
        renderAll();

        const loginButton = document.querySelector('.nav-login');
        if (loginButton) loginButton.onclick = openClientLogin;

        const exploreButton = document.querySelector('.nav-button');
        if (exploreButton) exploreButton.onclick = openApp;

        const landingButtons = document.querySelectorAll('[onclick="openApp()"]');
        landingButtons.forEach((button) => {
            button.onclick = openApp;
        });

        window.openApp = openApp;
        window.navigate = navigate;
        window.goBack = goBack;
        window.showScreen = showScreen;
        window.loginCliente = loginCliente;
        window.showClientScreen = showClientScreen;
        window.logoutCliente = logoutCliente;
        window.backToLanding = backToLanding;
        window.cadastrarPatrimonio = cadastrarPatrimonio;
        window.cadastrarUsuario = cadastrarUsuario;
        window.openClientLogin = openClientLogin;
    }

    bootstrap();
})();
