
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
