# INFOTEC
# StockFlow - Software House iPhone-7

**Problema:** Dificuldade no controlo de bens patrimoniais...
**Público-alvo:** Empresas que precisam de rastrear equipamentos...

### 🔗 Links do Projeto (N1)
* **Protótipo (Figma):** https://www.figma.com/make/IZcm6AmFR2OD0CvWAif1tA/StockFlow-web-interface-design?p=f&fullscreen=1
* **Aplicação (Vercel):** https://stockfloww-khe521w9d-yasmingegalvaos-projects.vercel.app/
* **GitHub Pages:** https://tvsinho8990-hub.github.io/INFOTEC/
## Stack Tecnológica

### Front-end

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Back-end

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)

### Banco de dados

![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

### Versionamento e ferramentas

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)


---

## Sistema online

Acesse o StockFlow pela hospedagem oficial:

https://infotecstockflow.pythonanywhere.com

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Python
- Flask
- SQLite
- Git e GitHub
- PythonAnywhere

## Banco de dados

O StockFlow utiliza um banco de dados relacional SQLite,
integrado ao sistema por meio de uma API desenvolvida em Flask.

### Estrutura das tabelas

| Tabela | Finalidade |
|---|---|
| usuarios | Cadastro e autenticacao de usuarios |
| patrimonios | Controle dos bens patrimoniais |
| estoque | Controle de produtos |
| movimentacoes | Historico de movimentacoes patrimoniais |
| estoque_movimentacoes | Historico de entradas e saidas |
| chamados | Solicitacoes de suporte tecnico |
| historico_chamados | Historico dos atendimentos |
| anexos | Armazenamento de arquivos |
| manutencoes | Controle de manutencoes patrimoniais |

O banco utiliza chaves primarias, chaves estrangeiras
e armazenamento de senhas com hash.

### Arquivos do backend

- backend/server.py: servidor Flask e rotas da API.
- backend/schema.sql: estrutura SQL do banco de dados.
- backend/seed.py: inicializacao dos dados demonstrativos.
- backend/stockflow.db: banco gerado durante a inicializacao.

O arquivo do banco nao precisa ser versionado, pois pode ser
recriado utilizando os scripts disponibilizados no repositorio.

## Como executar localmente

Requisitos: Python 3.12 e Git.

```bash
git clone https://github.com/tvsinho8990-hub/INFOTEC.git
cd INFOTEC
python -m pip install -r requirements.txt
python backend/seed.py
python backend/server.py
```

Acesse:

http://127.0.0.1:5000

## Verificacao da conexao com o banco

https://infotecstockflow.pythonanywhere.com/api/status

## Funcionalidades

- Autenticacao de usuarios.
- Dashboard patrimonial.
- Cadastro e consulta de patrimonios.
- Filtros de patrimonios.
- Gerenciamento de manutencoes.
- Controle de suporte tecnico.
- Abertura e acompanhamento de chamados.
- Gerenciamento administrativo de chamados.
- Registro de prioridades e prazos.
- Consulta de estoque e movimentacoes.

## Acesso demonstrativo

As credenciais devem ser solicitadas aos integrantes do projeto.

Sistema desenvolvido para fins academicos, utilizando dados ficticios.
