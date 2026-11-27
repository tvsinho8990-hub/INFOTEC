# INFOTEC | StockFlow

Sistema web para gerenciamento de patrimônio, estoque e movimentações, desenvolvido no contexto do projeto INFOTEC.

## 1. Sobre o projeto

O StockFlow tem como objetivo facilitar o controle de bens patrimoniais e produtos em estoque, permitindo acompanhar registros, movimentações e informações administrativas.

## 2. Tecnologias

- HTML5
- CSS3
- JavaScript
- LocalStorage e SessionStorage do navegador
- Google Fonts

## 3. Estrutura do projeto

```text
INFOTEC-integracao/
├── assets/
│   ├── css/
│   └── js/
├── docs/
│   └── documentacao.html
├── pages/
│   ├── index.html
│   ├── infotec.html
│   ├── Indexsup.html
│   └── infotec-contato.html
├── .gitignore
├── index.html
└── README.md
```

## 4. Requisitos para utilização

- Navegador atualizado, como Google Chrome, Microsoft Edge ou Firefox.
- Conexão com a internet para carregar as fontes externas.
- Visual Studio Code é recomendado para edição dos arquivos.

A versão web atual não exige instalação de Node.js ou dependências para sua utilização básica.

## 5. Como executar localmente

1. Baixe ou clone o repositório para seu computador.
2. Abra a pasta INFOTEC-integracao.
3. Localize o arquivo index.html.
4. Abra o arquivo no navegador.

A página inicial redireciona para a apresentação da INFOTEC.

### Acessar diretamente as páginas

| Página | Caminho |
|---|---|
| Portal INFOTEC | `pages/infotec.html` |
| Aplicação StockFlow | `pages/index.html` |
| Suporte | `pages/Indexsup.html` |
| Contato | `pages/infotec-contato.html` |
| Documentação | `docs/documentacao.html` |

### Execução com Visual Studio Code

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão Live Server, caso ainda não esteja instalada.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

## 6. Armazenamento de dados

A aplicação atual utiliza recursos de armazenamento do navegador:

- **LocalStorage:** mantém os dados da aplicação entre acessos no mesmo navegador e origem.
- **SessionStorage:** mantém informações da sessão administrativa durante a sessão da aba.

Os dados armazenados localmente não representam automaticamente um banco de dados centralizado ou sincronizado entre computadores.

Evite utilizar informações pessoais ou corporativas reais em ambientes de demonstração.

## 7. Configurações e segurança

- Não compartilhe arquivos `.env` ou credenciais.
- Não publique cópias de bancos de dados ou arquivos com informações privadas.
- Preserve o arquivo `.gitignore`.
- Não apague os dados locais sem verificar previamente sua necessidade.
- Utilize contas e informações de demonstração durante testes.

## 8. Links do projeto

- **Protótipo Figma:** https://www.figma.com/make/IZcm6AmFR2OD0CvWAif1tA/StockFlow-web-interface-design?p=f&fullscreen=1
- **Aplicação Vercel:** https://stockfloww-khe521w9d-yasmingegalvaos-projects.vercel.app/
- **GitHub Pages:** https://tvsinho8990-hub.github.io/INFOTEC/

## 9. Manutenção

1. Preserve a estrutura de pastas.
2. Mantenha os caminhos dos arquivos CSS e JavaScript.
3. Faça alterações na branch de desenvolvimento.
4. Revise as modificações antes de criar um commit.
5. Execute os testes pertinentes antes de publicar.

## 10. Documentação complementar

Consulte `docs/documentacao.html` para informações institucionais, diretrizes de uso, padrões de engenharia e canais de atendimento da INFOTEC.

---

**Projeto INFOTEC | StockFlow**
