
(() => {
    "use strict";

    function iniciarFiltros() {
        const tabela = document.getElementById("patrimonioTable");
        const pagina = document.getElementById("patrimonios");

        if (!tabela || !pagina) return;
        if (document.getElementById("sfFiltroPatrimonio")) return;

        const cabecalho = pagina.querySelector(".page-header");
        const novoPatrimonio = cabecalho?.querySelector(".action-button");

        if (!novoPatrimonio) return;

        // ESTILOS

        const estilo = document.createElement("style");

        estilo.textContent = `
            .sf-filtro-acoes {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            .sf-filtro-botao {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 18px;
                background: var(--white, #fff);
                border: 1px solid #dce4ef;
                border-radius: 6px;
                color: var(--text, #10243d);
                font-family: inherit;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: 0.2s;
            }

            .sf-filtro-botao:hover {
                border-color: #1769e0;
                color: #1769e0;
            }

            .sf-filtro-painel {
                background: var(--white, #fff);
                border: 1px solid #dce4ef;
                border-radius: 8px;
                padding: 22px;
                margin-bottom: 24px;
                color: var(--text, #10243d);
            }

            .sf-filtro-painel[hidden] {
                display: none !important;
            }

            .sf-filtro-titulo {
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 18px;
            }

            .sf-filtro-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 16px;
            }

            .sf-filtro-campo label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .sf-filtro-campo input,
            .sf-filtro-campo select {
                width: 100%;
                box-sizing: border-box;
                padding: 11px 12px;
                border: 1px solid #dce4ef;
                border-radius: 6px;
                background: var(--white, #fff);
                color: var(--text, #10243d);
                font-family: inherit;
                font-size: 13px;
                outline: none;
            }

            .sf-filtro-campo input:focus,
            .sf-filtro-campo select:focus {
                border-color: #1769e0;
            }

            .sf-filtro-rodape {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-top: 20px;
                flex-wrap: wrap;
            }

            .sf-filtro-contagem {
                color: var(--text-muted, #64748b);
                font-size: 12px;
            }

            .sf-filtro-oculto {
                display: none !important;
            }

            @media (max-width: 1000px) {
                .sf-filtro-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }

            @media (max-width: 550px) {
                .sf-filtro-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(estilo);

        // BOTAO FILTRAR

        const grupo = document.createElement("div");
        grupo.className = "sf-filtro-acoes";

        novoPatrimonio.before(grupo);

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "sf-filtro-botao";
        botao.setAttribute("aria-expanded", "false");
        botao.setAttribute("aria-controls", "sfFiltroPatrimonio");

        botao.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M4 7h16M7 12h10M10 17h4"/>
            </svg>
            Filtrar
        `;

        grupo.appendChild(botao);
        grupo.appendChild(novoPatrimonio);

        // PAINEL DE FILTROS

        const painel = document.createElement("div");

        painel.id = "sfFiltroPatrimonio";
        painel.className = "sf-filtro-painel";
        painel.hidden = true;

        painel.innerHTML = `
            <div class="sf-filtro-titulo">
                Filtros de patrimônio
            </div>

            <div class="sf-filtro-grid">

                <div class="sf-filtro-campo">
                    <label for="sfBuscaPatrimonio">
                        Buscar patrimônio
                    </label>
                    <input id="sfBuscaPatrimonio"
                        type="search"
                        placeholder="Código ou descrição">
                </div>

                <div class="sf-filtro-campo">
                    <label for="sfCategoriaFiltro">Categoria</label>
                    <select id="sfCategoriaFiltro">
                        <option value="">Todas as categorias</option>
                    </select>
                </div>

                <div class="sf-filtro-campo">
                    <label for="sfResponsavelFiltro">Responsável</label>
                    <select id="sfResponsavelFiltro">
                        <option value="">Todos os responsáveis</option>
                    </select>
                </div>

                <div class="sf-filtro-campo">
                    <label for="sfStatusFiltro">Status</label>
                    <select id="sfStatusFiltro">
                        <option value="">Todos os status</option>
                    </select>
                </div>

            </div>

            <div class="sf-filtro-rodape">

                <span class="sf-filtro-contagem"
                    id="sfFiltroContagem"
                    aria-live="polite">
                </span>

                <div class="sf-filtro-acoes">

                    <button type="button"
                        class="sf-filtro-botao"
                        id="sfLimparFiltros">
                        Limpar filtros
                    </button>

                    <button type="button"
                        class="action-button"
                        id="sfAplicarFiltros">
                        Aplicar filtros
                    </button>

                </div>
            </div>
        `;

        cabecalho.after(painel);

        const busca = document.getElementById("sfBuscaPatrimonio");
        const categoria = document.getElementById("sfCategoriaFiltro");
        const responsavel = document.getElementById("sfResponsavelFiltro");
        const status = document.getElementById("sfStatusFiltro");
        const contagem = document.getElementById("sfFiltroContagem");

        let filtros = {
            busca: "",
            categoria: "",
            responsavel: "",
            status: ""
        };

        function normalizar(valor) {
            return String(valor || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
        }

        function linhas() {
            return Array.from(tabela.rows)
                .filter(linha => linha.cells.length >= 5);
        }

        function preencherSelect(select, coluna, titulo) {

            const anterior = select.value;

            const valores = [...new Set(
                linhas()
                    .map(linha => linha.cells[coluna].textContent.trim())
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b, "pt-BR"));

            select.replaceChildren(new Option(titulo, ""));

            valores.forEach(valor => {
                select.add(new Option(
                    valor === "—" ? "Sem responsável" : valor,
                    valor
                ));
            });

            if (valores.includes(anterior)) {
                select.value = anterior;
            } else if (anterior) {
                select.add(new Option(anterior, anterior));
                select.value = anterior;
            }
        }

        function atualizarOpcoes() {
            preencherSelect(categoria, 2, "Todas as categorias");
            preencherSelect(responsavel, 3, "Todos os responsáveis");
            preencherSelect(status, 4, "Todos os status");
        }

        function aplicarFiltros() {

            let encontrados = 0;

            linhas().forEach(linha => {

                const codigo = linha.cells[0].textContent;
                const descricao = linha.cells[1].textContent;
                const cat = linha.cells[2].textContent.trim();
                const resp = linha.cells[3].textContent.trim();
                const situacao = linha.cells[4].textContent.trim();

                const corresponde =
                    normalizar(codigo + " " + descricao)
                        .includes(normalizar(filtros.busca)) &&

                    (!filtros.categoria ||
                        cat === filtros.categoria) &&

                    (!filtros.responsavel ||
                        resp === filtros.responsavel) &&

                    (!filtros.status ||
                        situacao === filtros.status);

                linha.classList.toggle(
                    "sf-filtro-oculto",
                    !corresponde
                );

                if (corresponde) encontrados++;
            });

            contagem.textContent =
                encontrados + " de " + linhas().length +
                " patrimônios encontrados";
        }

        botao.addEventListener("click", () => {
            painel.hidden = !painel.hidden;

            botao.setAttribute(
                "aria-expanded",
                String(!painel.hidden)
            );

            atualizarOpcoes();
            aplicarFiltros();
        });

        document.getElementById("sfAplicarFiltros")
            .addEventListener("click", () => {

                filtros = {
                    busca: busca.value,
                    categoria: categoria.value,
                    responsavel: responsavel.value,
                    status: status.value
                };

                aplicarFiltros();
            });

        document.getElementById("sfLimparFiltros")
            .addEventListener("click", () => {

                busca.value = "";
                categoria.value = "";
                responsavel.value = "";
                status.value = "";

                filtros = {
                    busca: "",
                    categoria: "",
                    responsavel: "",
                    status: ""
                };

                aplicarFiltros();
            });

        busca.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                document.getElementById("sfAplicarFiltros").click();
            }
        });

        // ATUALIZAR FILTROS QUANDO A TABELA MUDAR

        const observador = new MutationObserver(() => {
            atualizarOpcoes();
            aplicarFiltros();
        });

        observador.observe(tabela, {
            childList: true,
            subtree: true
        });

        atualizarOpcoes();
        aplicarFiltros();

        console.log("Filtros de patrimônio carregados com sucesso.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciarFiltros);
    } else {
        iniciarFiltros();
    }

})();
