
from server import conectar, inicializar
from werkzeug.security import generate_password_hash
import secrets

inicializar()

with conectar() as banco:

    usuarios = [
        ("João Silva", "joaosilva", "Tecnologia da Informação", "001245"),
        ("Carlos Oliveira", "carlosoliveira", "Financeiro", "001288")
    ]

    for nome, usuario, departamento, matricula in usuarios:
        banco.execute("""
            INSERT OR IGNORE INTO usuarios
            (nome, usuario, senha_hash, departamento, matricula)
            VALUES (?, ?, ?, ?, ?)
        """, (
            nome,
            usuario,
            generate_password_hash(secrets.token_urlsafe(24)),
            departamento,
            matricula
        ))

    banco.execute("""
        UPDATE usuarios SET matricula = '001266'
        WHERE usuario = 'carlasouza'
    """)

    banco.execute("""
        UPDATE usuarios SET matricula = '001299'
        WHERE usuario = 'anderson'
    """)

    def buscar_usuario(nome):
        registro = banco.execute(
            "SELECT id FROM usuarios WHERE nome = ?",
            (nome,)
        ).fetchone()

        return registro["id"] if registro else None

    patrimonios = [
        ("PT-0001", "Notebook Dell Latitude", "Informática",
         "João Silva", "Cautelado", "Bom"),

        ("PT-0002", "Monitor 24 polegadas", "Informática",
         None, "Disponível", "Bom"),

        ("PT-0003", "Impressora HP", "Equipamentos",
         "Carla Souza", "Cautelado", "Regular"),

        ("PT-0004", "Computador Desktop", "Informática",
         "Carla Souza", "Manutenção", "Necessita manutenção"),

        ("PT-0108", "Notebook Lenovo ThinkPad", "Informática",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0114", "Monitor Dell 24 polegadas", "Informática",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0121", "Teclado Logitech", "Informática",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0122", "Mouse Logitech", "Informática",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0130", "Notebook Dell Latitude", "Informática",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0134", "Webcam Logitech", "Equipamentos",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0140", "Headset profissional", "Equipamentos",
         "Anderson", "Cautelado", "Bom"),

        ("PT-0148", "Monitor LG 27 polegadas", "Informática",
         "Anderson", "Cautelado", "Bom")
    ]

    for codigo, descricao, categoria, responsavel, status, conservacao in patrimonios:

        banco.execute("""
            INSERT OR IGNORE INTO patrimonios
            (codigo, descricao, categoria, responsavel_id,
             status, conservacao)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            codigo,
            descricao,
            categoria,
            buscar_usuario(responsavel),
            status,
            conservacao
        ))

    pt0004 = banco.execute(
        "SELECT id, status FROM patrimonios WHERE codigo = 'PT-0004'"
    ).fetchone()

    if pt0004 and pt0004["status"] == "Manutenção":
        manutencao_aberta = banco.execute("""
            SELECT id FROM manutencoes
            WHERE patrimonio_id = ? AND status != 'Concluído'
        """, (pt0004["id"],)).fetchone()

        if not manutencao_aberta:
            banco.execute("""
                INSERT OR IGNORE INTO manutencoes (
                    codigo_solicitacao, patrimonio_id, status_anterior,
                    problema, status, data_abertura
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                "MNT-0001",
                pt0004["id"],
                "Cautelado",
                "Equipamento encaminhado para verificação técnica preventiva e revisão de hardware.",
                "Em manutenção",
                "2026-09-05"
            ))

    produtos = [
        ("Papel A4", "Material de escritório", 320, 100),
        ("Caneta azul", "Material de escritório", 42, 50),
        ("Mouse USB", "Informática", 87, 30)
    ]

    for produto, categoria, quantidade, minimo in produtos:

        existente = banco.execute(
            "SELECT id FROM estoque WHERE produto = ?",
            (produto,)
        ).fetchone()

        if not existente:
            banco.execute("""
                INSERT INTO estoque
                (produto, categoria, quantidade, minimo)
                VALUES (?, ?, ?, ?)
            """, (produto, categoria, quantidade, minimo))

print("Dados iniciais cadastrados com sucesso!")

with conectar() as banco:
    for tabela in [
        "usuarios",
        "patrimonios",
        "manutencoes",
        "estoque",
        "movimentacoes",
        "chamados"
    ]:
        total = banco.execute(
            "SELECT COUNT(*) FROM " + tabela
        ).fetchone()[0]

        print(tabela, ":", total)
