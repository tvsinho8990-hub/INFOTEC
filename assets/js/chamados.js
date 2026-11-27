
(() => {
    "use strict";

    const STORAGE_KEY = "stockflowTicketsV2";

    const statusOpcoes = [
        "Em análise",
        "Aceito",
        "Recusado",
        "Em andamento",
        "Concluído"
    ];

    const prioridades = [
        "Baixa",
        "Média",
        "Alta",
        "Urgente"
    ];

    const $ = id => document.getElementById(id);

    const usuarioAtual = () =>
        window.stockflowUsuarioAtual?.() || null;

    const administrador = () =>
        ["admin", "ti"].includes(usuarioAtual()?.tipo);

    function mostrarToast(titulo, descricao = "") {
        const anterior = document.getElementById("sfToast");

        if (anterior) anterior.remove();

        const toast = document.createElement("div");

        toast.id = "sfToast";
        toast.setAttribute("role", "status");

        toast.style.cssText = `
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 99999;
            background: #1769e0;
            color: #ffffff;
            padding: 16px 20px;
            border-radius: 9px;
            box-shadow: 0 8px 25px rgba(23,105,224,.28);
            display: flex;
            align-items: center;
            gap: 14px;
            max-width: calc(100vw - 40px);
            font-family: 'DM Sans', sans-serif;
            opacity: 0;
            transform: translateY(15px);
            transition: opacity .3s, transform .3s;
        `;

        toast.innerHTML = `
            <svg width="25" height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="flex-shrink:0">
                <rect x="3" y="3" width="18"
                    height="18" rx="4"/>
                <path d="m7 12 3 3 7-7"/>
            </svg>

            <div>
                <div style="font-size:14px;font-weight:600">
                    ${escapar(titulo)}
                </div>

                ${descricao ? `
                    <div style="
                        font-size:12px;
                        margin-top:5px;
                        opacity:.85">
                        ${escapar(descricao)}
                    </div>
                ` : ""}
            </div>

            <button type="button"
                aria-label="Fechar notificação"
                style="
                    background:transparent;
                    border:0;
                    color:white;
                    font-size:22px;
                    cursor:pointer;
                    margin-left:10px;
                    padding:0;
                ">×</button>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        function fechar() {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(15px)";

            setTimeout(() => toast.remove(), 300);
        }

        toast.querySelector("button")
            .addEventListener("click", fechar);

        setTimeout(fechar, 5000);
    }

    function escapar(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    async function apiChamados(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        credentials: "same-origin"
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || "Erro de comunicação com o servidor.");
    }

    return dados;
}

async function carregar() {
    return await apiChamados("/api/chamados");
}
function dataFormatada(data) {
        return data
            ? new Date(data).toLocaleString("pt-BR")
            : "Não informado";
    }

    function opcoes(lista, selecionado = "") {
        return lista.map(item => `
            <option value="${escapar(item)}"
                ${item === selecionado ? "selected" : ""}>
                ${escapar(item)}
            </option>
        `).join("");
    }

    function corStatus(status) {
        return {
            "Em análise": "pendente",
            "Aceito": "andamento",
            "Em andamento": "andamento",
            "Concluído": "concluido",
            "Recusado": "recusado"
        }[status] || "pendente";
    }

    // ==========================================
    // ARMAZENAMENTO DE ANEXOS
    // ==========================================

    function abrirBanco() {
        return new Promise((resolve, reject) => {
            const pedido = indexedDB.open(
                "StockFlowChamados", 1
            );

            pedido.onupgradeneeded = () => {
                const banco = pedido.result;

                if (!banco.objectStoreNames.contains("arquivos")) {
                    banco.createObjectStore("arquivos");
                }
            };

            pedido.onsuccess = () => resolve(pedido.result);
            pedido.onerror = () => reject(pedido.error);
        });
    }

    async function salvarArquivo(id, arquivo) {
        const banco = await abrirBanco();

        return new Promise((resolve, reject) => {
            const tx = banco.transaction(
                "arquivos", "readwrite"
            );

            tx.objectStore("arquivos").put(arquivo, id);

            tx.oncomplete = () => {
                banco.close();
                resolve();
            };

            tx.onerror = tx.onabort = () => {
                banco.close();
                reject(tx.error);
            };
        });
    }

    async function baixarArquivo(id) {
        if (!usuarioAtual()) return;

        const resposta = await fetch(
            "/api/chamados/" + encodeURIComponent(id) + "/anexo",
            { credentials: "same-origin" }
        );

        if (!resposta.ok) {
            alert("Não foi possível acessar o anexo.");
            return;
        }

        const arquivo = await resposta.blob();
        const chamados = await carregar();
        const chamado = chamados.find(c => String(c.id) === String(id));

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = url;
        link.download = chamado?.anexo || "anexo";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function instalarEstilos() {
        const style = document.createElement("style");

        style.textContent = `
            .sf-ticket-card {
                background: #fff;
                border: 1px solid #e5eaf0;
                border-radius: 10px;
                padding: 26px;
                margin-bottom: 20px;
                overflow-wrap: anywhere;
            }

            .sf-ticket-form {
                display: grid;
                gap: 18px;
                max-width: 950px;
            }

            .sf-ticket-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0,1fr));
                gap: 18px;
            }

            .sf-ticket-field {
                display: flex;
                flex-direction: column;
                gap: 7px;
            }

            .sf-ticket-field label {
                font-size: 14px;
                font-weight: 600;
                color: #10233f;
            }

            .sf-ticket-field input,
            .sf-ticket-field textarea,
            .sf-ticket-field select {
                width: 100%;
                padding: 12px;
                border: 1px solid #ccd6e3;
                border-radius: 7px;
                font: inherit;
                font-size: 14px;
                background: #fff;
            }

            .sf-ticket-field textarea {
                resize: vertical;
                min-height: 120px;
            }

            .sf-ticket-field input[readonly] {
                background: #f6f8fb;
                color: #68778d;
            }

            .sf-ticket-title {
                font-size: 16px;
                color: #10233f;
                border-bottom: 1px solid #e5eaf0;
                padding-bottom: 12px;
                margin-top: 12px;
            }

            .sf-ticket-details {
                background: #f6f8fb;
                border: 1px solid #e5eaf0;
                padding: 18px;
                border-radius: 8px;
                margin: 16px 0;
                font-size: 14px;
                line-height: 1.9;
            }

            .sf-ticket-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 16px;
            }

            .sf-ticket-status {
                font-size: 12px;
                font-weight: 700;
                padding: 7px 12px;
                border-radius: 6px;
            }

            .sf-ticket-status.pendente {
                background: #fff4db;
                color: #986300;
            }

            .sf-ticket-status.andamento {
                background: #eaf2ff;
                color: #1769e0;
            }

            .sf-ticket-status.concluido {
                background: #e7f6ed;
                color: #11653e;
            }

            .sf-ticket-status.recusado {
                background: #fdecea;
                color: #b42318;
            }

            .sf-ticket-actions {
                display: flex;
                justify-content: flex-end;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 12px;
            }

            .sf-ticket-description {
                white-space: pre-wrap;
                line-height: 1.8;
            }

            .sf-ticket-muted {
                font-size: 13px;
                color: #68778d;
            }

            .sf-ticket-summary {
                display: grid;
                grid-template-columns:
                    repeat(auto-fit, minmax(140px, 1fr));
                gap: 14px;
                margin-bottom: 25px;
            }

            .sf-ticket-summary div {
                padding: 20px;
                border: 1px solid #e5eaf0;
                border-radius: 8px;
                background: white;
            }

            .sf-ticket-summary strong {
                display: block;
                font-size: 28px;
                margin-top: 8px;
                color: #1769e0;
            }

            .sf-ticket-upload {
                border: 1px dashed #aebed2;
                border-radius: 8px;
                padding: 20px;
            }

            .sf-ticket-upload input {
                padding: 8px;
            }

            @media (max-width: 760px) {
                .sf-ticket-grid {
                    grid-template-columns: 1fr;
                }

                .sf-ticket-card {
                    padding: 18px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // ==========================================
    // FORMULÁRIO DO CLIENTE
    // ==========================================

    function criarTelaCliente() {
        const main = document.querySelector(".client-main");

        main.insertAdjacentHTML("beforeend", `
            <section class="client-page" id="client-support">

                <div class="page-header">
                    <div>
                        <h1>Central de suporte</h1>
                        <p>Solicite atendimento técnico para o StockFlow.</p>
                    </div>

                    <button type="button"
                        class="action-button"
                        data-sf-screen="client-requests">
                        Minhas solicitações
                    </button>
                </div>

                <form id="sfNovoChamado"
                    class="sf-ticket-card sf-ticket-form">

                    <div>
                        <h2>Nova solicitação de atendimento</h2>
                        <p class="sf-ticket-muted">
                            Preencha os dados abaixo para que nossa
                            equipe possa realizar o atendimento.
                        </p>
                    </div>

                    <h3 class="sf-ticket-title">
                        01 — Identificação do solicitante
                    </h3>

                    <div class="sf-ticket-grid">
                        <div class="sf-ticket-field">
                            <label>Nome completo</label>
                            <input id="sfNome" readonly>
                        </div>

                        <div class="sf-ticket-field">
                            <label>Departamento</label>
                            <input id="sfDepartamento" readonly>
                        </div>
                    </div>

                    <small class="sf-ticket-muted">
                        Informações preenchidas automaticamente
                        de acordo com a conta autenticada.
                    </small>

                    <h3 class="sf-ticket-title">
                        02 — Informações de contato
                    </h3>

                    <div class="sf-ticket-field">
                        <label for="sfEmail">
                            E-mail corporativo *
                        </label>

                        <input type="email"
                            id="sfEmail"
                            name="email"
                            maxlength="150"
                            placeholder="nome@empresa.com.br"
                            required>
                    </div>

                    <div class="sf-ticket-grid">

                        <div class="sf-ticket-field">
                            <label for="sfTelefone">
                                Telefone / WhatsApp *
                            </label>

                            <input type="tel"
                                id="sfTelefone"
                                name="telefone"
                                maxlength="20"
                                placeholder="(69) 99999-9999"
                                required>
                        </div>

                        <div class="sf-ticket-field">
                            <label for="sfRamal">Ramal</label>

                            <input id="sfRamal"
                                name="ramal"
                                maxlength="10"
                                placeholder="Opcional">
                        </div>

                    </div>

                    <div class="sf-ticket-field">
                        <label for="sfContato">
                            Preferência de contato *
                        </label>

                        <select id="sfContato"
                            name="contato" required>

                            <option value="">Selecione</option>
                            <option>E-mail</option>
                            <option>Telefone</option>
                            <option>WhatsApp</option>

                        </select>
                    </div>

                    <h3 class="sf-ticket-title">
                        03 — Detalhes da solicitação
                    </h3>

                    <div class="sf-ticket-grid">

                        <div class="sf-ticket-field">
                            <label for="sfCategoria">
                                Categoria *
                            </label>

                            <select id="sfCategoria"
                                name="categoria" required>

                                <option value="">Selecione</option>
                                <option>Problema no sistema</option>
                                <option>Patrimônio e tombamento</option>
                                <option>Estoque e movimentações</option>
                                <option>Acesso e permissões</option>
                                <option>Equipamentos</option>
                                <option>Solicitação de melhoria</option>
                                <option>Dúvida</option>
                                <option>Outros</option>

                            </select>
                        </div>

                        <div class="sf-ticket-field">
                            <label for="sfPatrimonio">
                                Número do patrimônio
                            </label>

                            <input id="sfPatrimonio"
                                name="patrimonio"
                                maxlength="30"
                                placeholder="Ex.: PT-0003">
                        </div>

                    </div>

                    <div class="sf-ticket-field">

                        <label for="sfImpacto">
                            Impacto nas atividades *
                        </label>

                        <select id="sfImpacto"
                            name="impacto" required>

                            <option value="">Selecione</option>
                            <option>Não impede minhas atividades</option>
                            <option>Prejudica parcialmente minhas atividades</option>
                            <option>Impede totalmente minhas atividades</option>

                        </select>

                        <small class="sf-ticket-muted">
                            A prioridade oficial será definida
                            pela equipe de TI.
                        </small>
                    </div>

                    <div class="sf-ticket-field">

                        <label for="sfAssunto">Assunto *</label>

                        <input id="sfAssunto"
                            name="assunto"
                            maxlength="120"
                            placeholder="Resuma o motivo da solicitação"
                            required>

                    </div>

                    <div class="sf-ticket-field">

                        <label for="sfDescricao">
                            Descrição detalhada *
                        </label>

                        <textarea id="sfDescricao"
                            name="descricao"
                            maxlength="1000"
                            placeholder="Descreva o problema, quando começou e quais atividades foram afetadas."
                            required></textarea>

                        <small id="sfContador"
                            class="sf-ticket-muted">
                            0/1000 caracteres
                        </small>

                    </div>

                    <h3 class="sf-ticket-title">
                        04 — Documentos e evidências
                    </h3>

                    <div class="sf-ticket-upload">

                        <label for="sfAnexo">
                            <strong>Adicionar arquivo</strong>
                        </label>

                        <p class="sf-ticket-muted">
                            Imagens ou documentos de até 10 MB.
                        </p>

                        <input type="file"
                            id="sfAnexo"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx">

                    </div>

                    <label style="display:flex;gap:10px;align-items:flex-start">

                        <input type="checkbox"
                            required
                            style="width:auto;margin-top:4px">

                        <span>
                            Confirmo que as informações fornecidas
                            estão corretas e autorizo o contato
                            da equipe de suporte.
                        </span>

                    </label>

                    <small class="sf-ticket-muted">
                        * Campos obrigatórios.
                    </small>

                    <div id="sfMensagem" role="status"></div>

                    <div class="sf-ticket-actions">

                        <button type="reset"
                            class="btn btn-secondary">
                            Limpar formulário
                        </button>

                        <button type="submit"
                            id="sfEnviar"
                            class="action-button">
                            Enviar solicitação
                        </button>

                    </div>

                    <small class="sf-ticket-muted">
                        Ambiente de demonstração:
                        armazenamento no banco de dados SQLite.
                    </small>

                </form>

            </section>

            <section class="client-page" id="client-requests">

                <div class="page-header">

                    <div>
                        <h1>Minhas solicitações</h1>
                        <p>Acompanhe seus chamados e prazos de atendimento.</p>
                    </div>

                    <button type="button"
                        class="action-button"
                        data-sf-screen="client-support">
                        Novo chamado
                    </button>

                </div>

                <div id="sfListaCliente"></div>

            </section>
        `);
    }

    // ==========================================
    // TELA DO ADMINISTRADOR
    // ==========================================

    function criarTelaAdmin() {
        const main = document.querySelector("#app .main");

        main.insertAdjacentHTML("beforeend", `
            <section class="page" id="admin-support">

                <div class="page-header">
                    <div>
                        <h1>Gerenciamento de chamados</h1>
                        <p>Central de atendimento da equipe de TI.</p>
                    </div>
                </div>

                <div class="sf-ticket-summary" id="sfResumo"></div>

                <div class="sf-ticket-card">

                    <div class="sf-ticket-grid">

                        <div class="sf-ticket-field">

                            <label>Pesquisar chamado</label>

                            <input id="sfPesquisa"
                                placeholder="Protocolo, assunto ou solicitante">

                        </div>

                        <div class="sf-ticket-field">

                            <label>Filtrar por status</label>

                            <select id="sfFiltro">
                                <option value="">Todos</option>
                                ${opcoes(statusOpcoes)}
                            </select>

                        </div>

                    </div>

                </div>

                <div id="sfListaAdmin"></div>

            </section>
        `);
    }

    // ==========================================
    // MENUS
    // ==========================================

    function instalarMenus() {
        const cliente = $("clientSidebar");
        const admin = $("adminSidebar");

        cliente.querySelectorAll(
            '[data-client-screen="client-support"],' +
            '[data-client-screen="client-requests"]'
        ).forEach(el => el.remove());

        admin.querySelectorAll(
            '[data-screen="admin-support"]'
        ).forEach(el => el.remove());

        const menuCliente = document.createElement("div");

        menuCliente.innerHTML = `
            <div class="menu-label">Suporte</div>

            <button type="button"
                class="client-menu"
                data-client-screen="client-support"
                data-sf-screen="client-support">
                Solicitar suporte
            </button>

            <button type="button"
                class="client-menu"
                data-client-screen="client-requests"
                data-sf-screen="client-requests">
                Minhas solicitações
            </button>
        `;

        const sairCliente = cliente.querySelector(".client-logout");

        if (sairCliente) {
            sairCliente.before(menuCliente);
        } else {
            cliente.appendChild(menuCliente);
        }

        const menuAdmin = document.createElement("div");

        menuAdmin.innerHTML = `
            <div class="menu-label">Suporte</div>

            <button type="button"
                class="menu-button"
                data-screen="admin-support"
                data-sf-screen="admin-support">
                Gerenciar chamados
            </button>
        `;

        const sairAdmin = admin.querySelector(
            '[onclick="logoutAdmin()"]'
        );

        if (sairAdmin) {
            sairAdmin.before(menuAdmin);
        } else {
            admin.appendChild(menuAdmin);
        }
    }

    // ==========================================
    // ENVIO DA SOLICITAÇÃO
    // ==========================================

    function preencherUsuario() {
        const usuario = usuarioAtual();

        $("sfNome").value = usuario?.nome || "";
        $("sfDepartamento").value =
            usuario?.departamento || "";
    }

    function configurarFormulario() {
        const form = $("sfNovoChamado");

        $("sfDescricao").addEventListener("input", () => {
            $("sfContador").textContent =
                $("sfDescricao").value.length +
                "/1000 caracteres";
        });

        form.addEventListener("reset", () => {
            setTimeout(() => {
                preencherUsuario();
                $("sfContador").textContent =
                    "0/1000 caracteres";
                $("sfMensagem").textContent = "";
            }, 0);
        });

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const usuario = usuarioAtual();

            if (!usuario || administrador()) {
                alert("Faça login como cliente.");
                return;
            }

            if ($("sfEnviar").disabled) return;
            if (!form.reportValidity()) return;

            const dados = Object.fromEntries(
                new FormData(form).entries()
            );

            Object.keys(dados).forEach(chave => {
                dados[chave] = String(dados[chave]).trim();
            });

            const telefone = dados.telefone.replace(/\D/g, "");

            if (![10, 11].includes(telefone.length)) {
                alert("Informe um telefone válido com DDD.");
                return;
            }

            if (!dados.assunto || !dados.descricao) {
                alert("Preencha o assunto e a descrição.");
                return;
            }

            const anexo = $("sfAnexo").files[0];

            if (anexo && (
                anexo.size > 10 * 1024 * 1024 ||
                !/\.(jpg|jpeg|png|pdf|doc|docx)$/i.test(anexo.name)
            )) {
                alert("Selecione um arquivo permitido de até 10 MB.");
                return;
            }

            const id = window.crypto?.randomUUID?.() ||
                Date.now().toString(36) +
                Math.random().toString(36).slice(2);

            const protocolo = "SF-" +
                new Date().getFullYear() + "-" +
                id.replace(/-/g, "").slice(-8).toUpperCase();

            const data = new Date().toISOString();

            const chamado = {
                ...dados,
                id,
                protocolo,
                usuario: usuario.usuario,
                nome: usuario.nome,
                departamento: usuario.departamento || "",
                anexo: anexo?.name || null,
                status: "Em análise",
                prioridade: "",
                prazo: "",
                observacao: "",
                criadoEm: data,
                atualizadoEm: data,
                historico: [
                    {
                        status: "Em análise",
                        data,
                        responsavel: usuario.nome
                    }
                ]
            };

            $("sfEnviar").disabled = true;
            $("sfEnviar").textContent = "Enviando...";

            try {
                const formulario = new FormData(form);

                if (anexo) {
                    formulario.append("anexo", anexo);
                }

                const resultado = await apiChamados("/api/chamados", {
                    method: "POST",
                    body: formulario
                });

                form.reset();

                mostrarToast(
                    "Solicitação registrada com sucesso!",
                    "Protocolo: " + resultado.protocolo
                );

                await abrirTela("client-requests");

            } catch (erro) {
                console.error("Erro ao salvar chamado:", erro);

                alert("Não foi possível salvar a solicitação.");

            } finally {
                $("sfEnviar").disabled = false;
                $("sfEnviar").textContent = "Enviar solicitação";
            }
        });
    }

    // ==========================================
    // COMPONENTES DOS CHAMADOS
    // ==========================================

    function cabecalho(c) {
        return `
            <div class="sf-ticket-header">

                <div>
                    <small style="color:#1769e0">
                        ${escapar(c.protocolo || c.id)}
                    </small>

                    <h2>${escapar(c.assunto)}</h2>

                    <small class="sf-ticket-muted">
                        Aberto em ${dataFormatada(c.criadoEm)}
                    </small>
                </div>

                <span class="sf-ticket-status ${corStatus(c.status)}">
                    ${escapar(c.status)}
                </span>

            </div>
        `;
    }

    function informacoes(c) {
        return `
            <div class="sf-ticket-details">

                <div class="sf-ticket-grid">

                    <p><strong>Categoria:</strong>
                        ${escapar(c.categoria)}
                    </p>

                    <p><strong>Patrimônio:</strong>
                        ${escapar(c.patrimonio || "Não informado")}
                    </p>

                    <p><strong>Impacto:</strong>
                        ${escapar(c.impacto)}
                    </p>

                    <p><strong>Prioridade:</strong>
                        ${escapar(c.prioridade || "A definir")}
                    </p>

                    <p><strong>Prazo estimado:</strong>
                        ${escapar(c.prazo || "A definir")}
                    </p>

                </div>

            </div>

            <h3>Descrição da solicitação</h3>

            <p class="sf-ticket-description">
                ${escapar(c.descricao)}
            </p>

            ${c.anexo ? `
                <button type="button"
                    class="btn btn-secondary"
                    style="margin-top:15px"
                    data-sf-anexo="${escapar(c.id)}">
                    📎 ${escapar(c.anexo)}
                </button>
            ` : ""}
        `;
    }

    function historico(c) {
        return `
            <details class="sf-ticket-details">

                <summary style="cursor:pointer;font-weight:600">
                    Histórico do atendimento
                </summary>

                ${(c.historico || []).map(item => `
                    <div style="
                        border-left:2px solid #1769e0;
                        padding:8px 12px;
                        margin-top:12px
                    ">

                        <strong>${escapar(item.status)}</strong>

                        <p>${dataFormatada(item.data)}</p>

                        <small>
                            ${escapar(item.responsavel)}
                        </small>

                    </div>
                `).join("")}

            </details>
        `;
    }

    // ==========================================
    // MINHAS SOLICITAÇÕES
    // ==========================================

    async function renderCliente() {
        const usuario = usuarioAtual();
        const lista = $("sfListaCliente");

        lista.innerHTML = "";

        if (!usuario || administrador()) return;

        const chamados = (await carregar()).filter(
            c => c.usuario === usuario.usuario
        );

        if (!chamados.length) {
            lista.innerHTML = `
                <div class="sf-ticket-card client-empty">

                    <h3>Nenhuma solicitação registrada</h3>

                    <p>Seus chamados aparecerão aqui.</p>

                    <br>

                    <button type="button"
                        class="action-button"
                        data-sf-screen="client-support">
                        Abrir solicitação
                    </button>

                </div>
            `;

            return;
        }

        lista.innerHTML = chamados.map(c => `
            <article class="sf-ticket-card">

                ${cabecalho(c)}
                ${informacoes(c)}

                <div class="sf-ticket-details">

                    <h3>Resposta da equipe de TI</h3>

                    <p class="sf-ticket-description">
                        ${escapar(
                            c.observacao ||
                            "Sua solicitação está aguardando análise."
                        )}
                    </p>

                    <small>
                        Última atualização:
                        ${dataFormatada(c.atualizadoEm)}
                    </small>

                </div>

                ${historico(c)}

            </article>
        `).join("");
    }

    // ==========================================
    // GERENCIAMENTO ADMINISTRATIVO
    // ==========================================

    async function renderAdmin() {
        const lista = $("sfListaAdmin");

        lista.innerHTML = "";

        if (!administrador()) return;

        const todos = await carregar();

        const resumo = [
            ["Total", todos.length],
            ["Em análise", todos.filter(
                c => c.status === "Em análise"
            ).length],
            ["Em atendimento", todos.filter(
                c => ["Aceito", "Em andamento"].includes(c.status)
            ).length],
            ["Concluídos", todos.filter(
                c => c.status === "Concluído"
            ).length],
            ["Recusados", todos.filter(
                c => c.status === "Recusado"
            ).length]
        ];

        $("sfResumo").innerHTML = resumo.map(item => `
            <div>
                <small>${item[0]}</small>
                <strong>${item[1]}</strong>
            </div>
        `).join("");

        const pesquisa = $("sfPesquisa")
            .value.trim().toLowerCase();

        const filtro = $("sfFiltro").value;

        const chamados = todos.filter(c => {
            const texto = [
                c.protocolo,
                c.assunto,
                c.nome,
                c.email
            ].join(" ").toLowerCase();

            return texto.includes(pesquisa) &&
                (!filtro || c.status === filtro);
        });

        if (!chamados.length) {
            lista.innerHTML = `
                <div class="sf-ticket-card client-empty">
                    Nenhum chamado encontrado.
                </div>
            `;
            return;
        }

        lista.innerHTML = chamados.map(c => `
            <article class="sf-ticket-card">

                ${cabecalho(c)}

                <div class="sf-ticket-details">

                    <h3>Identificação e contato</h3>

                    <div class="sf-ticket-grid">

                        <p><strong>Solicitante:</strong>
                            ${escapar(c.nome)}
                        </p>

                        <p><strong>Departamento:</strong>
                            ${escapar(c.departamento)}
                        </p>

                        <p><strong>E-mail:</strong>
                            ${escapar(c.email)}
                        </p>

                        <p><strong>Telefone:</strong>
                            ${escapar(c.telefone)}
                        </p>

                        <p><strong>Ramal:</strong>
                            ${escapar(c.ramal || "Não informado")}
                        </p>

                        <p><strong>Contato preferencial:</strong>
                            ${escapar(c.contato)}
                        </p>

                    </div>

                </div>

                ${informacoes(c)}

                <form class="sf-ticket-form"
                    data-sf-editar="${escapar(c.id)}"
                    style="margin-top:25px">

                    <h3 class="sf-ticket-title">
                        Avaliação da equipe de TI
                    </h3>

                    <div class="sf-ticket-grid">

                        <div class="sf-ticket-field">

                            <label>Status</label>

                            <select name="status">
                                ${opcoes(statusOpcoes, c.status)}
                            </select>

                        </div>

                        <div class="sf-ticket-field">

                            <label>Prioridade</label>

                            <select name="prioridade">

                                <option value="">A definir</option>

                                ${opcoes(prioridades, c.prioridade)}

                            </select>

                        </div>

                    </div>

                    <div class="sf-ticket-field">

                        <label>Estimativa de resolução</label>

                        <input name="prazo"
                            maxlength="100"
                            value="${escapar(c.prazo)}"
                            placeholder="Ex.: 48 horas ou 2 dias úteis">

                    </div>

                    <div class="sf-ticket-field">

                        <label>Parecer técnico / Justificativa</label>

                        <textarea name="observacao"
                            maxlength="1000"
                            placeholder="Informe a resposta ao solicitante.">${escapar(c.observacao)}</textarea>

                    </div>

                    <div class="sf-ticket-actions">

                        <button type="button"
                            class="btn"
                            data-sf-decisao="Aceito"
                            style="background:#e7f6ed;color:#11653e">

                            Aceitar chamado

                        </button>

                        <button type="button"
                            class="btn"
                            data-sf-decisao="Recusado"
                            style="background:#fdecea;color:#b42318">

                            Recusar chamado

                        </button>

                        <button type="submit"
                            class="action-button">

                            Salvar alterações

                        </button>

                    </div>

                </form>

                ${historico(c)}

            </article>
        `).join("");
    }

    async function atualizarChamado(form) {
        if (!administrador()) {
            alert("Acesso negado.");
            return;
        }

        const dados = Object.fromEntries(
            new FormData(form).entries()
        );

        const status = dados.status;
        const prioridade = dados.prioridade;
        const prazo = dados.prazo.trim();
        const observacao = dados.observacao.trim();

        if (!statusOpcoes.includes(status)) return;

        if (prioridade && !prioridades.includes(prioridade)) {
            return;
        }

        if (status === "Recusado" && !observacao) {
            alert("Informe a justificativa da recusa.");
            return;
        }

        if (["Aceito", "Em andamento", "Concluído"].includes(status)
            && (!prioridade || !prazo)) {

            alert("Defina a prioridade e o prazo estimado.");
            return;
        }

        if (status === "Concluído" && !observacao) {
            alert("Informe a solução aplicada.");
            return;
        }

        await apiChamados("/api/chamados/" + form.dataset.sfEditar, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status,
                prioridade,
                prazo,
                observacao
            })
        });

        mostrarToast(
            "Chamado atualizado com sucesso!",
            "Alterações salvas no banco de dados."
        );

        await renderAdmin();
    }

    // ==========================================
    // NAVEGAÇÃO
    // ==========================================

    async function abrirTela(tela) {
        const usuario = usuarioAtual();

        if (!usuario) {
            alert("Entre na sua conta para acessar o suporte.");
            window.openClientLogin?.();
            return;
        }

        if (tela === "admin-support") {
            if (!administrador()) {
                alert("Acesso restrito à administração.");
                return;
            }

            window.navigate(tela);
            renderAdmin();

        } else {
            if (administrador()) return;

            window.showClientScreen(tela);

            if (tela === "client-support") {
                $("sfNovoChamado").reset();
                preencherUsuario();
            }

            if (tela === "client-requests") {
                await renderCliente();
            }
        }

        window.closeAllSidebars?.();
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    function iniciar() {
        if (
            !$("clientSidebar") ||
            !$("adminSidebar") ||
            !document.querySelector(".client-main") ||
            !document.querySelector("#app .main") ||
            typeof window.stockflowUsuarioAtual !== "function"
        ) {
            console.warn(
                "Suporte: integração com o StockFlow não encontrada."
            );

            return;
        }

        instalarEstilos();
        criarTelaCliente();
        criarTelaAdmin();
        instalarMenus();
        configurarFormulario();

        $("sfPesquisa").addEventListener(
            "input", renderAdmin
        );

        $("sfFiltro").addEventListener(
            "change", renderAdmin
        );

        document.addEventListener("click", event => {
            const tela = event.target.closest("[data-sf-screen]");

            if (tela) {
                try {
                    abrirTela(tela.dataset.sfScreen).catch(erro => alert(erro.message));
                } catch (erro) {
                    console.error("Erro no suporte:", erro);
                    alert("Não foi possível abrir o suporte.");
                }

                return;
            }

            const anexo = event.target.closest("[data-sf-anexo]");

            if (anexo) {
                baixarArquivo(anexo.dataset.sfAnexo)
                    .catch(console.error);

                return;
            }

            const decisao = event.target.closest("[data-sf-decisao]");

            if (decisao) {
                const form = decisao.closest("form");

                form.elements.status.value =
                    decisao.dataset.sfDecisao;

                form.requestSubmit();
            }
        });

        document.addEventListener("submit", event => {
            const form = event.target;

            if (!form.matches("[data-sf-editar]")) return;

            event.preventDefault();

            try {
                atualizarChamado(form).catch(erro => alert(erro.message));
            } catch (erro) {
                console.error(erro);
                alert("Não foi possível atualizar o chamado.");
            }
        });

        ["logoutCliente", "logoutAdmin", "backToLanding"].forEach(nome => {
            const original = window[nome];

            if (typeof original !== "function") return;

            window[nome] = function(...args) {
                const resultado = original.apply(this, args);

                $("sfListaCliente").innerHTML = "";
                $("sfListaAdmin").innerHTML = "";
                $("sfNovoChamado").reset();

                return resultado;
            };
        });

        if (new URLSearchParams(location.search).has("suporte")) {
            window.openClientLogin?.();
        }

        console.log("Módulo de suporte carregado com sucesso.");
    }

    function iniciarComProtecao() {
        try {
            iniciar();
        } catch (erro) {
            console.error("Erro ao iniciar módulo de suporte:", erro);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarComProtecao
        );
    } else {
        iniciarComProtecao();
    }

})();

