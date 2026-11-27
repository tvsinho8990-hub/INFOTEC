(function () {
    'use strict';

    const form = document.getElementById('infotecContactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    const storageKey = 'infotecContactRequests';
    const allowedServices = [
        'Sistema StockFlow',
        'Desenvolvimento de Sistemas / ERP',
        'Infraestrutura e Redes',
        'Consultoria Tecnológica',
        'Outro Projeto'
    ];
    const allowedBudgets = [
        'Sob consulta',
        'Até R$ 10.000',
        'R$ 10.000 - R$ 30.000',
        'Acima de R$ 30.000'
    ];

    const field = (id) => document.getElementById(id);
    const showStatus = (type, message) => {
        status.className = `form-status ${type}`;
        status.setAttribute('role', type === 'error' ? 'alert' : 'status');
        status.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        status.textContent = message;
    };

    const readRequests = () => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw === null) return [];

            const records = JSON.parse(raw);
            if (!Array.isArray(records) || records.some((item) =>
                !item || typeof item !== 'object' || Array.isArray(item) ||
                typeof item.protocolo !== 'string' ||
                typeof item.nome !== 'string' ||
                typeof item.email !== 'string' ||
                typeof item.servico !== 'string' ||
                typeof item.orcamento !== 'string' ||
                typeof item.mensagem !== 'string' ||
                typeof item.criadoEm !== 'string'
            )) return null;

            return records;
        } catch (error) {
            return null;
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const nome = field('name').value.trim();
        const email = field('email').value.trim();
        const servico = field('service').value;
        const orcamento = field('budget').value;
        const mensagem = field('message').value.trim();
        const termos = field('terms').checked;

        if (nome.length < 3 || nome.length > 100) {
            showStatus('error', 'O nome deve ter entre 3 e 100 caracteres.');
            field('name').focus();
            return;
        }

        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showStatus('error', 'Informe um endereço de e-mail válido.');
            field('email').focus();
            return;
        }

        if (!allowedServices.includes(servico)) {
            showStatus('error', 'Selecione um serviço válido.');
            field('service').focus();
            return;
        }

        if (!allowedBudgets.includes(orcamento)) {
            showStatus('error', 'Selecione uma faixa de orçamento válida.');
            field('budget').focus();
            return;
        }

        if (mensagem.length < 10 || mensagem.length > 2000) {
            showStatus('error', 'A mensagem deve ter entre 10 e 2.000 caracteres.');
            field('message').focus();
            return;
        }

        if (!termos) {
            showStatus('error', 'É necessário aceitar o contato da equipe INFOTEC.');
            field('terms').focus();
            return;
        }

        const requests = readRequests();
        if (requests === null) {
            showStatus('error', 'O histórico local está inválido ou inacessível. Os dados existentes foram preservados; não foi possível registrar a solicitação.');
            return;
        }

        const agora = new Date();
        const data = [
            agora.getFullYear(),
            String(agora.getMonth() + 1).padStart(2, '0'),
            String(agora.getDate()).padStart(2, '0')
        ].join('');
        const sufixo = window.crypto && window.crypto.randomUUID
            ? window.crypto.randomUUID().slice(0, 8).toUpperCase()
            : Math.random().toString(36).slice(2, 10).toUpperCase();
        const protocolo = `INF-${data}-${sufixo}`;

        requests.push({
            protocolo,
            nome,
            email,
            servico,
            orcamento,
            mensagem,
            aceiteTermos: true,
            status: 'Registrada neste navegador',
            criadoEm: agora.toISOString()
        });

        try {
            localStorage.setItem(storageKey, JSON.stringify(requests));
        } catch (error) {
            showStatus('error', 'Não foi possível salvar a solicitação neste navegador. Verifique o espaço disponível e as permissões de armazenamento.');
            return;
        }

        form.reset();
        showStatus(
            'success',
            `Solicitação registrada neste navegador. Protocolo: ${protocolo}. Atenção: ela ainda não foi enviada à equipe INFOTEC, pois não há integração com servidor.`
        );
    });

    form.addEventListener('reset', () => {
        status.className = 'form-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.textContent = '';
    });
})();