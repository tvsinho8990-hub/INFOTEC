/*
 * StockFlow - dados iniciais da demonstração.
 * Espelham seed.sql (valide com: python build_db.py).
 * Carregado antes de app.js; o estado do usuário fica no localStorage.
 */
window.STOCKFLOW_DEFAULT_STATE = {
    "patrimonios": [
        {
            "codigo": "PT-0001",
            "descricao": "Notebook Dell Latitude",
            "categoria": "Informática",
            "responsavel": "João Silva",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-25"
        },
        {
            "codigo": "PT-0002",
            "descricao": "Monitor 24\"",
            "categoria": "Informática",
            "responsavel": "—",
            "status": "Disponível",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-25"
        },
        {
            "codigo": "PT-0003",
            "descricao": "Impressora HP",
            "categoria": "Equipamentos",
            "responsavel": "Maria Souza",
            "status": "Cautelado",
            "conservacao": "Regular",
            "dataCadastro": "2026-08-25"
        },
        {
            "codigo": "PT-0004",
            "descricao": "Computador Desktop",
            "categoria": "Informática",
            "responsavel": "—",
            "status": "Manutenção",
            "conservacao": "Necessita manutenção",
            "dataCadastro": "2026-08-25"
        },
        {
            "codigo": "PT-0108",
            "descricao": "Notebook Lenovo ThinkPad",
            "categoria": "Informática",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-12"
        },
        {
            "codigo": "PT-0114",
            "descricao": "Monitor Dell 24\"",
            "categoria": "Informática",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-12"
        },
        {
            "codigo": "PT-0121",
            "descricao": "Teclado Logitech",
            "categoria": "Informática",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-12"
        },
        {
            "codigo": "PT-0122",
            "descricao": "Mouse Logitech",
            "categoria": "Informática",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-12"
        },
        {
            "codigo": "PT-0130",
            "descricao": "Notebook Dell Latitude",
            "categoria": "Informática",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-15"
        },
        {
            "codigo": "PT-0134",
            "descricao": "Webcam Logitech",
            "categoria": "Equipamentos",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-20"
        },
        {
            "codigo": "PT-0140",
            "descricao": "Headset profissional",
            "categoria": "Equipamentos",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-20"
        },
        {
            "codigo": "PT-0148",
            "descricao": "Monitor LG 27\"",
            "categoria": "Informática",
            "responsavel": "Anderson",
            "status": "Cautelado",
            "conservacao": "Bom",
            "dataCadastro": "2026-08-25"
        }
    ],
    "usuarios": [
        {
            "nome": "João Silva",
            "departamento": "Tecnologia da Informação",
            "matricula": "001245",
            "status": "Ativo"
        },
        {
            "nome": "Maria Souza",
            "departamento": "Administrativo",
            "matricula": "001266",
            "status": "Ativo"
        },
        {
            "nome": "Carlos Oliveira",
            "departamento": "Financeiro",
            "matricula": "001288",
            "status": "Ativo"
        },
        {
            "nome": "Anderson",
            "departamento": "Financeiro",
            "matricula": "001300",
            "status": "Ativo"
        }
    ],
    "estoque": [
        {
            "produto": "Papel A4",
            "categoria": "Material de escritório",
            "quantidade": 320,
            "minimo": 100
        },
        {
            "produto": "Caneta azul",
            "categoria": "Material de escritório",
            "quantidade": 42,
            "minimo": 50
        },
        {
            "produto": "Mouse USB",
            "categoria": "Informática",
            "quantidade": 87,
            "minimo": 30
        }
    ],
    "movimentacoes": [
        {
            "data": "2026-09-04",
            "patrimonio": "PT-0001",
            "acao": "Cautela",
            "responsavel": "João Silva",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-09-03",
            "patrimonio": "PT-0003",
            "acao": "Transferência",
            "responsavel": "Maria Souza",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-09-02",
            "patrimonio": "PT-0004",
            "acao": "Manutenção",
            "responsavel": "—",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-09-01",
            "patrimonio": "PT-0002",
            "acao": "Devolução",
            "responsavel": "—",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-25",
            "patrimonio": "PT-0148",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-20",
            "patrimonio": "PT-0140",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-20",
            "patrimonio": "PT-0134",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-15",
            "patrimonio": "PT-0130",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-12",
            "patrimonio": "PT-0122",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-12",
            "patrimonio": "PT-0121",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-12",
            "patrimonio": "PT-0114",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        },
        {
            "data": "2026-08-12",
            "patrimonio": "PT-0108",
            "acao": "Cautela",
            "responsavel": "Anderson",
            "registradoPor": "Administrador"
        }
    ],
    "estoqueMovimentos": [
        {
            "produto": "Mouse USB",
            "tipo": "Entrada",
            "quantidade": 87,
            "data": "2026-09-01"
        },
        {
            "produto": "Caneta azul",
            "tipo": "Entrada",
            "quantidade": 42,
            "data": "2026-09-01"
        },
        {
            "produto": "Papel A4",
            "tipo": "Entrada",
            "quantidade": 320,
            "data": "2026-09-01"
        }
    ],
    "clientes": [
        {
            "usuario": "anderson",
            "nome": "Anderson",
            "departamento": "Financeiro"
        }
    ]
};
