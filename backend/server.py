
import sqlite3
import secrets
import uuid

from pathlib import Path
from functools import wraps

from flask import (
    Flask, request, jsonify, session,
    send_from_directory, send_file
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from io import BytesIO

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
DATABASE = BASE / "stockflow.db"

app = Flask(__name__)

app.secret_key = secrets.token_hex(32)
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Strict"


# ==========================================
# BANCO DE DADOS
# ==========================================

def conectar():
    banco = sqlite3.connect(DATABASE)
    banco.row_factory = sqlite3.Row
    banco.execute("PRAGMA foreign_keys = ON")
    return banco


def inicializar():
    with conectar() as banco:

        banco.executescript(
            (BASE / "schema.sql").read_text(
                encoding="utf-8-sig"
            )
        )

        usuarios = [
            ("Administrador", "admin", "admin",
             "Tecnologia da Informação", "admin"),

            ("Carla Souza", "carlasouza", "123",
             "Administrativo", "cliente"),

            ("Anderson", "anderson", "123456",
             "Financeiro", "cliente"),

            ("Equipe de TI", "ti", "123",
             "Tecnologia da Informação", "ti")
        ]

        for nome, usuario, senha, departamento, tipo in usuarios:

            banco.execute("""
                INSERT OR IGNORE INTO usuarios
                (nome, usuario, senha_hash, departamento, tipo)
                VALUES (?, ?, ?, ?, ?)
            """, (
                nome,
                usuario,
                generate_password_hash(senha),
                departamento,
                tipo
            ))

        migrar_manutencoes(banco)


def gerar_codigo_manutencao(banco):
    registros = banco.execute(
        "SELECT codigo_solicitacao FROM manutencoes"
    ).fetchall()

    maior = 0
    for item in registros:
        codigo = str(item["codigo_solicitacao"] or "")
        if codigo.startswith("MNT-") and codigo[4:].isdigit():
            maior = max(maior, int(codigo[4:]))

    return f"MNT-{maior + 1:04d}"


def migrar_manutencoes(banco):
    """Garante consistência para patrimônios já cadastrados em manutenção."""
    patrimonios = banco.execute("""
        SELECT id, responsavel_id, data_cadastro
        FROM patrimonios
        WHERE status = 'Manutenção'
    """).fetchall()

    for pat in patrimonios:
        aberta = banco.execute("""
            SELECT id FROM manutencoes
            WHERE patrimonio_id = ? AND status != 'Concluído'
        """, (pat["id"],)).fetchone()

        if not aberta:
            status_anterior = "Cautelado" if pat["responsavel_id"] else "Disponível"
            banco.execute("""
                INSERT INTO manutencoes (
                    codigo_solicitacao, patrimonio_id, status_anterior,
                    problema, status, data_abertura
                )
                VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_DATE))
            """, (
                gerar_codigo_manutencao(banco),
                pat["id"],
                status_anterior,
                "Registro migrado automaticamente: equipamento encontrava-se em manutenção.",
                "Em espera",
                pat["data_cadastro"]
            ))


# ==========================================
# SEGURANÇA E PERMISSÕES
# ==========================================

@app.before_request
def verificar_origem():
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        origem = request.headers.get("Origin")

        if origem and origem != request.host_url.rstrip("/"):
            return jsonify({"erro": "Origem não autorizada"}), 403


def usuario_atual():
    identificador = session.get("usuario_id")

    if not identificador:
        return None

    with conectar() as banco:
        usuario = banco.execute("""
            SELECT id, nome, usuario, departamento, tipo
            FROM usuarios
            WHERE id = ? AND ativo = 1
        """, (identificador,)).fetchone()

    return dict(usuario) if usuario else None


def exigir_login(funcao):
    @wraps(funcao)
    def executar(*args, **kwargs):
        if not usuario_atual():
            return jsonify({"erro": "Faça login"}), 401

        return funcao(*args, **kwargs)

    return executar


def exigir_admin(funcao):
    @wraps(funcao)
    def executar(*args, **kwargs):
        usuario = usuario_atual()

        if not usuario or usuario["tipo"] not in ("admin", "ti"):
            return jsonify({"erro": "Acesso negado"}), 403

        return funcao(*args, **kwargs)

    return executar


# ==========================================
# PÁGINAS DO STOCKFLOW
# ==========================================

@app.get("/")
def pagina_inicial():
    return send_from_directory(
        ROOT / "pages", "index.html"
    )


@app.get("/pages/<path:arquivo>")
def paginas(arquivo):
    return send_from_directory(ROOT / "pages", arquivo)


@app.get("/assets/<path:arquivo>")
def recursos(arquivo):
    return send_from_directory(ROOT / "assets", arquivo)


@app.get("/docs/<path:arquivo>")
def documentos(arquivo):
    return send_from_directory(ROOT / "docs", arquivo)


# ==========================================
# LOGIN
# ==========================================

@app.post("/api/login")
def login():
    dados = request.get_json(silent=True) or {}

    nome_usuario = str(
        dados.get("usuario", "")
    ).strip().lower()

    senha = str(dados.get("senha", ""))

    with conectar() as banco:

        usuario = banco.execute("""
            SELECT * FROM usuarios
            WHERE usuario = ? AND ativo = 1
        """, (nome_usuario,)).fetchone()

        if not usuario or not check_password_hash(
            usuario["senha_hash"], senha
        ):
            return jsonify({
                "erro": "Usuário ou senha inválidos"
            }), 401

        session.clear()
        session["usuario_id"] = usuario["id"]

    return jsonify(usuario_atual())


@app.get("/api/me")
@exigir_login
def minha_conta():
    return jsonify(usuario_atual())


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"sucesso": True})


# ==========================================
# CONSULTAR CHAMADOS
# ==========================================

@app.get("/api/chamados")
@exigir_login
def listar_chamados():

    usuario = usuario_atual()

    consulta = """
        SELECT
            c.*,
            u.nome,
            u.usuario,
            u.departamento
        FROM chamados c
        JOIN usuarios u ON u.id = c.usuario_id
    """

    parametros = []

    if usuario["tipo"] == "cliente":
        consulta += " WHERE c.usuario_id = ?"
        parametros.append(usuario["id"])

    consulta += " ORDER BY c.id DESC"

    with conectar() as banco:
        registros = banco.execute(
            consulta, parametros
        ).fetchall()

        resultado = []

        for registro in registros:
            chamado = dict(registro)

            historico = banco.execute("""
                SELECT h.status, h.data,
                       u.nome AS responsavel
                FROM historico_chamados h
                JOIN usuarios u ON u.id = h.usuario_id
                WHERE h.chamado_id = ?
                ORDER BY h.id
            """, (chamado["id"],)).fetchall()

            anexo = banco.execute("""
                SELECT nome FROM anexos
                WHERE chamado_id = ?
                LIMIT 1
            """, (chamado["id"],)).fetchone()

            chamado["historico"] = [
                dict(item) for item in historico
            ]

            chamado["anexo"] = (
                anexo["nome"] if anexo else None
            )

            chamado["criadoEm"] = chamado["criado_em"]
            chamado["atualizadoEm"] = chamado["atualizado_em"]

            resultado.append(chamado)

    return jsonify(resultado)


# ==========================================
# CRIAR CHAMADOS
# ==========================================

@app.post("/api/chamados")
@exigir_login
def criar_chamado():

    usuario = usuario_atual()

    dados = (
        request.form
        if request.mimetype == "multipart/form-data"
        else request.get_json(silent=True) or {}
    )

    campos = [
        "email", "telefone", "ramal", "contato",
        "categoria", "patrimonio", "impacto",
        "assunto", "descricao"
    ]

    valores = {
        campo: str(dados.get(campo, "")).strip()
        for campo in campos
    }

    obrigatorios = [
        "email", "telefone", "categoria",
        "impacto", "assunto", "descricao", "contato"
    ]

    if any(not valores[c] for c in obrigatorios):
        return jsonify({
            "erro": "Preencha os campos obrigatórios"
        }), 400

    if len(valores["descricao"]) > 1000:
        return jsonify({"erro": "Descrição muito longa"}), 400

    if len(valores["assunto"]) > 120:
        return jsonify({"erro": "Assunto muito longo"}), 400

    arquivo = request.files.get("anexo")
    conteudo = None

    if arquivo and arquivo.filename:

        extensao = Path(arquivo.filename).suffix.lower()

        if extensao not in (
            ".jpg", ".jpeg", ".png",
            ".pdf", ".doc", ".docx"
        ):
            return jsonify({"erro": "Formato inválido"}), 400

        conteudo = arquivo.read(10 * 1024 * 1024 + 1)

        if len(conteudo) > 10 * 1024 * 1024:
            return jsonify({"erro": "Anexo acima de 10 MB"}), 400

    protocolo = "SF-" + uuid.uuid4().hex[:12].upper()

    with conectar() as banco:

        cursor = banco.execute("""
            INSERT INTO chamados (
                protocolo, usuario_id, email, telefone,
                ramal, contato, categoria, patrimonio,
                impacto, assunto, descricao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            protocolo,
            usuario["id"],
            *[valores[campo] for campo in campos]
        ))

        chamado_id = cursor.lastrowid

        banco.execute("""
            INSERT INTO historico_chamados
            (chamado_id, usuario_id, status)
            VALUES (?, ?, ?)
        """, (
            chamado_id,
            usuario["id"],
            "Em análise"
        ))

        if conteudo is not None:

            banco.execute("""
                INSERT INTO anexos
                (chamado_id, nome, tipo, arquivo)
                VALUES (?, ?, ?, ?)
            """, (
                chamado_id,
                Path(arquivo.filename).name,
                "application/octet-stream",
                conteudo
            ))

    return jsonify({
        "sucesso": True,
        "id": chamado_id,
        "protocolo": protocolo
    }), 201


# ==========================================
# ATUALIZAR CHAMADOS - ADMIN / TI
# ==========================================

@app.patch("/api/chamados/<int:chamado_id>")
@exigir_admin
def atualizar_chamado(chamado_id):

    usuario = usuario_atual()
    dados = request.get_json(silent=True) or {}

    status = str(dados.get("status", "")).strip()
    prioridade = dados.get("prioridade") or None
    prazo = str(dados.get("prazo", "")).strip()
    observacao = str(dados.get("observacao", "")).strip()

    status_validos = [
        "Em análise", "Aceito", "Recusado",
        "Em andamento", "Concluído"
    ]

    prioridades_validas = [
        None, "Baixa", "Média", "Alta", "Urgente"
    ]

    if status not in status_validos:
        return jsonify({"erro": "Status inválido"}), 400

    if prioridade not in prioridades_validas:
        return jsonify({"erro": "Prioridade inválida"}), 400

    if status in ("Recusado", "Concluído") and not observacao:
        return jsonify({
            "erro": "Informe o parecer técnico"
        }), 400

    if status in ("Aceito", "Em andamento", "Concluído"):
        if not prioridade or not prazo:
            return jsonify({
                "erro": "Informe prioridade e prazo"
            }), 400

    with conectar() as banco:

        cursor = banco.execute("""
            UPDATE chamados
            SET status = ?,
                prioridade = ?,
                prazo = ?,
                observacao = ?,
                atendente_id = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            status,
            prioridade,
            prazo,
            observacao,
            usuario["id"],
            chamado_id
        ))

        if cursor.rowcount == 0:
            return jsonify({"erro": "Chamado não encontrado"}), 404

        banco.execute("""
            INSERT INTO historico_chamados (
                chamado_id, usuario_id, status, observacao
            )
            VALUES (?, ?, ?, ?)
        """, (
            chamado_id,
            usuario["id"],
            status,
            observacao
        ))

    return jsonify({"sucesso": True})


# ==========================================
# DOWNLOAD DE ANEXOS
# ==========================================

@app.get("/api/chamados/<int:chamado_id>/anexo")
@exigir_login
def baixar_anexo(chamado_id):

    usuario = usuario_atual()

    with conectar() as banco:

        chamado = banco.execute("""
            SELECT usuario_id FROM chamados
            WHERE id = ?
        """, (chamado_id,)).fetchone()

        if not chamado:
            return jsonify({"erro": "Chamado não encontrado"}), 404

        if usuario["tipo"] == "cliente":
            if chamado["usuario_id"] != usuario["id"]:
                return jsonify({"erro": "Acesso negado"}), 403

        anexo = banco.execute("""
            SELECT nome, arquivo FROM anexos
            WHERE chamado_id = ?
            LIMIT 1
        """, (chamado_id,)).fetchone()

        if not anexo:
            return jsonify({"erro": "Anexo não encontrado"}), 404

        return send_file(
            BytesIO(anexo["arquivo"]),
            as_attachment=True,
            download_name=anexo["nome"],
            mimetype="application/octet-stream"
        )


# ==========================================
# PATRIMÔNIOS E MANUTENÇÕES
# ==========================================

def serializar_patrimonio(registro):
    return {
        "id": registro["id"],
        "codigo": registro["codigo"],
        "descricao": registro["descricao"],
        "categoria": registro["categoria"],
        "responsavelId": registro["responsavel_id"],
        "responsavel": registro["responsavel_nome"] or "—",
        "departamento": registro["responsavel_departamento"] or "Não vinculado",
        "status": registro["status"] or "Disponível",
        "conservacao": registro["conservacao"] or "Bom",
        "dataCadastro": registro["data_cadastro"]
    }


def serializar_manutencao(registro):
    return {
        "numericId": registro["id"],
        "id": registro["codigo_solicitacao"],
        "patrimonioId": registro["patrimonio_id"],
        "patrimonioCodigo": registro["patrimonio_codigo"],
        "patrimonioNome": registro["patrimonio_descricao"],
        "patrimonioCategoria": registro["patrimonio_categoria"],
        "patrimonioResponsavel": registro["responsavel_nome"] or "—",
        "patrimonioDepartamento": registro["responsavel_departamento"] or "Não vinculado",
        "patrimonioConservacao": registro["patrimonio_conservacao"] or "Bom",
        "statusAnterior": registro["status_anterior"],
        "problema": registro["problema"],
        "status": registro["status"],
        "dataAbertura": registro["data_abertura"],
        "dataConclusao": registro["data_conclusao"]
    }


@app.get("/api/usuarios")
@exigir_login
def listar_usuarios():
    with conectar() as banco:
        registros = banco.execute("""
            SELECT
                u.id,
                u.nome,
                u.usuario,
                u.departamento,
                u.matricula,
                u.tipo,
                u.ativo,
                COUNT(p.id) AS patrimonio_count
            FROM usuarios u
            LEFT JOIN patrimonios p ON p.responsavel_id = u.id
            WHERE u.ativo = 1
            GROUP BY u.id
            ORDER BY u.nome
        """).fetchall()

    return jsonify([
        {
            "id": r["id"],
            "nome": r["nome"],
            "usuario": r["usuario"],
            "departamento": r["departamento"] or "Geral",
            "matricula": r["matricula"] or "—",
            "tipo": r["tipo"],
            "patrimonioCount": r["patrimonio_count"],
            "status": "Ativo"
        }
        for r in registros
    ])


@app.get("/api/patrimonios")
@exigir_login
def listar_patrimonios():
    with conectar() as banco:
        registros = banco.execute("""
            SELECT
                p.*,
                u.nome AS responsavel_nome,
                u.departamento AS responsavel_departamento
            FROM patrimonios p
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            ORDER BY p.id DESC
        """).fetchall()

    return jsonify([serializar_patrimonio(r) for r in registros])


@app.post("/api/patrimonios")
@exigir_admin
def criar_patrimonio():
    usuario = usuario_atual()
    dados = request.get_json(silent=True) or {}

    codigo = str(dados.get("codigo", "")).strip()
    descricao = str(dados.get("descricao", "")).strip()
    categoria = str(dados.get("categoria", "")).strip()
    conservacao = str(dados.get("conservacao", "Bom")).strip() or "Bom"
    data_cadastro = str(dados.get("dataCadastro", "")).strip() or None

    if not codigo or not descricao or not categoria:
        return jsonify({"erro": "Preencha código, descrição e categoria."}), 400

    with conectar() as banco:
        duplicado = banco.execute(
            "SELECT id FROM patrimonios WHERE LOWER(codigo) = LOWER(?)",
            (codigo,)
        ).fetchone()

        if duplicado:
            return jsonify({"erro": f"Já existe um patrimônio com o tombo {codigo}."}), 409

        cursor = banco.execute("""
            INSERT INTO patrimonios (
                codigo, descricao, categoria, status, conservacao, data_cadastro
            )
            VALUES (?, ?, ?, 'Disponível', ?, COALESCE(?, CURRENT_DATE))
        """, (codigo, descricao, categoria, conservacao, data_cadastro))

        patrimonio_id = cursor.lastrowid

        banco.execute("""
            INSERT INTO movimentacoes (
                patrimonio_id, responsavel_id, registrado_por, acao
            )
            VALUES (?, NULL, ?, 'Cadastro')
        """, (patrimonio_id, usuario["id"]))

        criado = banco.execute("""
            SELECT
                p.*,
                u.nome AS responsavel_nome,
                u.departamento AS responsavel_departamento
            FROM patrimonios p
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            WHERE p.id = ?
        """, (patrimonio_id,)).fetchone()

    return jsonify(serializar_patrimonio(criado)), 201


@app.put("/api/patrimonios/<int:patrimonio_id>")
@exigir_admin
def editar_patrimonio(patrimonio_id):
    dados = request.get_json(silent=True) or {}

    codigo = str(dados.get("codigo", "")).strip()
    descricao = str(dados.get("descricao", "")).strip()
    categoria = str(dados.get("categoria", "")).strip()
    responsavel_nome = str(dados.get("responsavel", "")).strip()
    conservacao = str(dados.get("conservacao", "Bom")).strip() or "Bom"
    data_cadastro = str(dados.get("dataCadastro", "")).strip() or None
    novo_status = str(dados.get("status", "")).strip()

    if not codigo or not descricao or not categoria:
        return jsonify({"erro": "Número de tombo, descrição e categoria são obrigatórios."}), 400

    if novo_status not in ("Disponível", "Cautelado", "Manutenção"):
        return jsonify({"erro": "Status de patrimônio inválido."}), 400

    with conectar() as banco:
        atual = banco.execute(
            "SELECT * FROM patrimonios WHERE id = ?",
            (patrimonio_id,)
        ).fetchone()

        if not atual:
            return jsonify({"erro": "Patrimônio não encontrado."}), 404

        duplicado = banco.execute(
            "SELECT id FROM patrimonios WHERE LOWER(codigo) = LOWER(?) AND id != ?",
            (codigo, patrimonio_id)
        ).fetchone()

        if duplicado:
            return jsonify({"erro": f"Já existe outro patrimônio cadastrado com o tombo {codigo}."}), 409

        manutencao_aberta = banco.execute("""
            SELECT id, codigo_solicitacao
            FROM manutencoes
            WHERE patrimonio_id = ? AND status != 'Concluído'
        """, (patrimonio_id,)).fetchone()

        if manutencao_aberta and novo_status != "Manutenção":
            return jsonify({
                "erro": f"Não é possível alterar manualmente o status enquanto a manutenção {manutencao_aberta['codigo_solicitacao']} estiver aberta."
            }), 409

        if not manutencao_aberta and novo_status == "Manutenção" and atual["status"] != "Manutenção":
            return jsonify({
                "erro": "Para colocar um patrimônio em manutenção, utilize a opção Manutenção para registrar a solicitação."
            }), 400

        responsavel_id = None
        if responsavel_nome and responsavel_nome != "—":
            resp_row = banco.execute(
                "SELECT id FROM usuarios WHERE nome = ?",
                (responsavel_nome,)
            ).fetchone()
            responsavel_id = resp_row["id"] if resp_row else atual["responsavel_id"]

        banco.execute("""
            UPDATE patrimonios
            SET codigo = ?,
                descricao = ?,
                categoria = ?,
                responsavel_id = ?,
                status = ?,
                conservacao = ?,
                data_cadastro = COALESCE(?, data_cadastro)
            WHERE id = ?
        """, (
            codigo,
            descricao,
            categoria,
            responsavel_id,
            novo_status,
            conservacao,
            data_cadastro,
            patrimonio_id
        ))

        atualizado = banco.execute("""
            SELECT
                p.*,
                u.nome AS responsavel_nome,
                u.departamento AS responsavel_departamento
            FROM patrimonios p
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            WHERE p.id = ?
        """, (patrimonio_id,)).fetchone()

    return jsonify(serializar_patrimonio(atualizado))


@app.delete("/api/patrimonios/<int:patrimonio_id>")
@exigir_admin
def excluir_patrimonio_api(patrimonio_id):
    with conectar() as banco:
        patrimonio = banco.execute(
            "SELECT id, codigo FROM patrimonios WHERE id = ?",
            (patrimonio_id,)
        ).fetchone()

        if not patrimonio:
            return jsonify({"erro": "Patrimônio não encontrado."}), 404

        manutencao_aberta = banco.execute("""
            SELECT codigo_solicitacao FROM manutencoes
            WHERE patrimonio_id = ? AND status != 'Concluído'
        """, (patrimonio_id,)).fetchone()

        if manutencao_aberta:
            return jsonify({
                "erro": f"Conclua a manutenção {manutencao_aberta['codigo_solicitacao']} antes de excluir o patrimônio."
            }), 409

        banco.execute("DELETE FROM manutencoes WHERE patrimonio_id = ?", (patrimonio_id,))
        banco.execute("DELETE FROM movimentacoes WHERE patrimonio_id = ?", (patrimonio_id,))
        banco.execute("DELETE FROM patrimonios WHERE id = ?", (patrimonio_id,))

    return jsonify({"sucesso": True})


@app.get("/api/manutencoes")
@exigir_login
def listar_manutencoes():
    with conectar() as banco:
        registros = banco.execute("""
            SELECT
                m.*,
                p.codigo AS patrimonio_codigo,
                p.descricao AS patrimonio_descricao,
                p.categoria AS patrimonio_categoria,
                p.conservacao AS patrimonio_conservacao,
                u.nome AS responsavel_nome,
                u.departamento AS responsavel_departamento
            FROM manutencoes m
            JOIN patrimonios p ON p.id = m.patrimonio_id
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            ORDER BY m.id DESC
        """).fetchall()

    return jsonify([serializar_manutencao(r) for r in registros])


@app.post("/api/manutencoes")
@exigir_admin
def criar_manutencao():
    usuario = usuario_atual()
    dados = request.get_json(silent=True) or {}

    codigo_patrimonio = str(dados.get("codigoPatrimonio", "")).strip()
    problema = str(dados.get("problema", "")).strip()
    data_abertura = str(dados.get("dataAbertura", "")).strip() or None

    if not codigo_patrimonio:
        return jsonify({"erro": "Patrimônio não informado."}), 400

    if not problema:
        return jsonify({"erro": "Descreva o problema apresentado pelo equipamento."}), 400

    with conectar() as banco:
        patrimonio = banco.execute(
            "SELECT * FROM patrimonios WHERE codigo = ?",
            (codigo_patrimonio,)
        ).fetchone()

        if not patrimonio:
            return jsonify({"erro": "Patrimônio não encontrado."}), 404

        if patrimonio["status"] == "Manutenção":
            return jsonify({"erro": "Este equipamento já está em manutenção e não pode ser encaminhado novamente."}), 409

        aberta = banco.execute("""
            SELECT codigo_solicitacao FROM manutencoes
            WHERE patrimonio_id = ? AND status != 'Concluído'
        """, (patrimonio["id"],)).fetchone()

        if aberta:
            return jsonify({"erro": f"Este patrimônio já possui uma solicitação aberta ({aberta['codigo_solicitacao']})."}), 409

        status_anterior = patrimonio["status"] or "Disponível"
        if status_anterior not in ("Disponível", "Cautelado"):
            return jsonify({"erro": f"Status atual inválido para encaminhamento: {status_anterior}."}), 400

        codigo_solicitacao = gerar_codigo_manutencao(banco)

        cursor = banco.execute("""
            INSERT INTO manutencoes (
                codigo_solicitacao, patrimonio_id, status_anterior,
                problema, status, data_abertura, registrado_por
            )
            VALUES (?, ?, ?, ?, 'Em espera', COALESCE(?, CURRENT_DATE), ?)
        """, (
            codigo_solicitacao,
            patrimonio["id"],
            status_anterior,
            problema,
            data_abertura,
            usuario["id"]
        ))

        manutencao_id = cursor.lastrowid

        banco.execute(
            "UPDATE patrimonios SET status = 'Manutenção' WHERE id = ?",
            (patrimonio["id"],)
        )

        banco.execute("""
            INSERT INTO movimentacoes (
                patrimonio_id, responsavel_id, registrado_por, acao
            )
            VALUES (?, ?, ?, 'Manutenção')
        """, (patrimonio["id"], patrimonio["responsavel_id"], usuario["id"]))

        criada = banco.execute("""
            SELECT
                m.*,
                p.codigo AS patrimonio_codigo,
                p.descricao AS patrimonio_descricao,
                p.categoria AS patrimonio_categoria,
                p.conservacao AS patrimonio_conservacao,
                u.nome AS responsavel_nome,
                u.departamento AS responsavel_departamento
            FROM manutencoes m
            JOIN patrimonios p ON p.id = m.patrimonio_id
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            WHERE m.id = ?
        """, (manutencao_id,)).fetchone()

    return jsonify(serializar_manutencao(criada)), 201


@app.patch("/api/manutencoes/<codigo_ou_id>")
@exigir_admin
def atualizar_manutencao(codigo_ou_id):
    usuario = usuario_atual()
    dados = request.get_json(silent=True) or {}
    novo_status = str(dados.get("novoStatus", "")).strip()

    if novo_status not in ("Em espera", "Em manutenção", "Concluído"):
        return jsonify({"erro": "Status de manutenção inválido."}), 400

    with conectar() as banco:
        manutencao = banco.execute("""
            SELECT * FROM manutencoes
            WHERE codigo_solicitacao = ? OR CAST(id AS TEXT) = ?
        """, (str(codigo_ou_id), str(codigo_ou_id))).fetchone()

        if not manutencao:
            return jsonify({"erro": "Solicitação de manutenção não encontrada."}), 404

        if manutencao["status"] == "Concluído":
            return jsonify({"erro": "Esta manutenção já foi concluída e não pode mais ser alterada."}), 409

        patrimonio = banco.execute(
            "SELECT * FROM patrimonios WHERE id = ?",
            (manutencao["patrimonio_id"],)
        ).fetchone()

        if not patrimonio:
            return jsonify({"erro": "Patrimônio vinculado à manutenção não foi encontrado."}), 404

        if novo_status == "Concluído":
            status_anterior = manutencao["status_anterior"]
            if status_anterior not in ("Disponível", "Cautelado"):
                return jsonify({"erro": "Status anterior inválido para restauração."}), 400

            banco.execute("""
                UPDATE manutencoes
                SET status = 'Concluído',
                    data_conclusao = CURRENT_DATE,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (manutencao["id"],))

            banco.execute(
                "UPDATE patrimonios SET status = ? WHERE id = ?",
                (status_anterior, patrimonio["id"])
            )

            banco.execute("""
                INSERT INTO movimentacoes (
                    patrimonio_id, responsavel_id, registrado_por, acao
                )
                VALUES (?, ?, ?, 'Retorno de manutenção')
            """, (patrimonio["id"], patrimonio["responsavel_id"], usuario["id"]))
        else:
            banco.execute("""
                UPDATE manutencoes
                SET status = ?,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (novo_status, manutencao["id"]))

            banco.execute(
                "UPDATE patrimonios SET status = 'Manutenção' WHERE id = ?",
                (patrimonio["id"],)
            )

        atualizada = banco.execute("""
            SELECT
                m.*,
                p.codigo AS patrimonio_codigo,
                p.descricao AS patrimonio_descricao,
                p.categoria AS patrimonio_categoria,
                p.conservacao AS patrimonio_conservacao,
                u.nome AS responsavel_nome,
                u.departamento AS responsavel_departamento
            FROM manutencoes m
            JOIN patrimonios p ON p.id = m.patrimonio_id
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            WHERE m.id = ?
        """, (manutencao["id"],)).fetchone()

    return jsonify(serializar_manutencao(atualizada))


# ==========================================
# TESTE DO SERVIDOR
# ==========================================

@app.get("/api/status")
def status_servidor():
    with conectar() as banco:
        banco.execute("SELECT 1")

    return jsonify({
        "servidor": "Online",
        "banco": "SQLite",
        "conexao": "Funcionando"
    })


if __name__ == "__main__":
    inicializar()

    print("StockFlow iniciado!")
    print("Acesse: http://127.0.0.1:5000")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )
