# StockFlow

Sistema web estático para gestão de estoque e patrimônio.

## Estrutura

```text
StockFlow/
├── assets/
│   ├── css/
│   │   └── theme.css       # Tokens, tipografia e componentes compartilhados
│   └── js/
│       └── support.js      # Comportamento do formulário de suporte
├── docs/
│   ├── ARCHITECTURE.md
│   └── documentacao.html   # Documentação acessível pela INFOTEC
├── pages/
│   ├── index.html           # Plataforma e aplicação administrativa
│   ├── Indexsup.html        # Atendimento e abertura de solicitações
│   ├── infotec.html         # Página institucional da INFOTEC
│   └── LANDING PAGE.html    # Landing page alternativa
└── .gitignore
```

## Organização de responsabilidades

- HTML concentra estrutura semântica, conteúdo e IDs usados pela aplicação.
- `pages/index.html` é a entrada principal da aplicação.
- CSS compartilhado fica em `assets/css`; regras específicas de uma página continuam próximas da marcação até a próxima etapa de modularização.
- JavaScript reutilizável fica em `assets/js`.
- Dados do suporte são simulados no `localStorage` do navegador pela chave `stockflowSupportRequests`.
- A autenticação do portal continua sendo uma demonstração local (`admin` / `admin`) e não representa segurança de produção.

## Execução local

Abra `pages/index.html` diretamente no navegador. Não há dependências de instalação nem etapa de build.
