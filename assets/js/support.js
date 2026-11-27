(() => {
    'use strict';

    const form = document.getElementById('supportForm');
    if (!form) return;

    const message = document.getElementById('message');
    const characterCount = document.getElementById('characterCount');
    const attachment = document.getElementById('attachment');
    const fileName = document.getElementById('fileName');
    const formStatus = document.getElementById('formStatus');
    const requestsKey = 'stockflowSupportRequests';
    const maxFileSize = 10 * 1024 * 1024;
    let manterStatus = false; // o reset do envio não deve apagar a mensagem de sucesso
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

    const readRequests = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(requestsKey) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    };

    const showStatus = (type, text) => {
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = text;
    };

    const clearStatus = () => {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
    };

    const updateCharacterCount = () => {
        characterCount.textContent = `${message.value.length}/1000`;
    };

    // Valida pela extensão: alguns navegadores não informam o tipo MIME de .doc/.docx
    const arquivoValido = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        return file.size <= maxFileSize && allowedExtensions.includes(extension);
    };

    const gerarProtocolo = (total) => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `SF-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${String(total + 1).padStart(4, '0')}`;
    };

    message.addEventListener('input', updateCharacterCount);

    attachment.addEventListener('change', () => {
        clearStatus();
        const file = attachment.files[0];

        if (!file) {
            fileName.textContent = '';
            return;
        }
        if (!arquivoValido(file)) {
            attachment.value = '';
            fileName.textContent = '';
            showStatus('error', 'Escolha um arquivo JPG, PNG, PDF, DOC ou DOCX de até 10 MB.');
            return;
        }
        fileName.textContent = `Arquivo selecionado: ${file.name}`;
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        clearStatus();

        if (!form.reportValidity()) return;

        const campo = (id) => document.getElementById(id).value.trim();
        const requests = readRequests();
        const protocolo = gerarProtocolo(requests.length);

        requests.push({
            protocolo,
            nome: campo('name'),
            email: campo('email'),
            categoria: campo('category'),
            prioridade: campo('priority'),
            assunto: campo('subject'),
            mensagem: message.value.trim(),
            anexo: attachment.files[0] ? attachment.files[0].name : null,
            aceiteTermos: true,
            status: 'Aberta',
            criadoEm: new Date().toISOString()
        });

        try {
            localStorage.setItem(requestsKey, JSON.stringify(requests));
        } catch (error) {
            showStatus('error', 'Não foi possível salvar a solicitação neste navegador.');
            return;
        }

        const nome = campo('name');
        manterStatus = true;
        form.reset();
        updateCharacterCount();
        fileName.textContent = '';
        showStatus('success', `Solicitação enviada, ${nome}. Protocolo ${protocolo} salvo neste navegador.`);
    });

    form.addEventListener('reset', () => {
        window.setTimeout(() => {
            updateCharacterCount();
            fileName.textContent = '';
            if (!manterStatus) clearStatus();
            manterStatus = false;
        }, 0);
    });

    const notification = document.getElementById('notificationButton');
    if (notification) {
        notification.addEventListener('click', () => {
            const count = readRequests().length;
            showStatus('success', count
                ? `Você tem ${count} solicitação(ões) registrada(s) neste navegador.`
                : 'Nenhuma solicitação registrada neste navegador.');
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // Mostra o administrador logado no topo, quando houver sessão
    try {
        const sessao = JSON.parse(sessionStorage.getItem('stockflowSession'));
        if (sessao && sessao.tipo === 'admin' && sessao.nome) {
            const nomeEl = document.querySelector('.user-info strong');
            const avatar = document.querySelector('.user-avatar');
            const papelEl = document.querySelector('.user-info span');
            if (papelEl) papelEl.textContent = 'Administrador';
            if (nomeEl) nomeEl.textContent = sessao.nome;
            if (avatar) avatar.textContent = sessao.nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
        }
    } catch (error) { /* sem sessão */ }

    updateCharacterCount();
})();
