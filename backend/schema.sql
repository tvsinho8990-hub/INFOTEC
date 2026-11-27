
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    usuario TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    departamento TEXT,
    matricula TEXT UNIQUE,
    tipo TEXT NOT NULL DEFAULT 'cliente'
        CHECK (tipo IN ('admin', 'ti', 'cliente')),
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patrimonios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    responsavel_id INTEGER,
    status TEXT DEFAULT 'Disponível',
    conservacao TEXT DEFAULT 'Bom',
    data_cadastro DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto TEXT NOT NULL,
    categoria TEXT NOT NULL,
    quantidade INTEGER DEFAULT 0 CHECK (quantidade >= 0),
    minimo INTEGER DEFAULT 0 CHECK (minimo >= 0)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patrimonio_id INTEGER NOT NULL,
    responsavel_id INTEGER,
    registrado_por INTEGER NOT NULL,
    acao TEXT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patrimonio_id) REFERENCES patrimonios(id),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    registrado_por INTEGER NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES estoque(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS chamados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocolo TEXT NOT NULL UNIQUE,
    usuario_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    ramal TEXT,
    contato TEXT,
    categoria TEXT NOT NULL,
    patrimonio TEXT,
    impacto TEXT NOT NULL,
    assunto TEXT NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT DEFAULT 'Em análise'
        CHECK (status IN (
            'Em análise',
            'Aceito',
            'Recusado',
            'Em andamento',
            'Concluído'
        )),
    prioridade TEXT
        CHECK (prioridade IN (
            'Baixa', 'Média', 'Alta', 'Urgente'
        )),
    prazo TEXT,
    observacao TEXT,
    atendente_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (atendente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historico_chamados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chamado_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    observacao TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS anexos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chamado_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT,
    arquivo BLOB NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
);

CREATE INDEX IF NOT EXISTS idx_chamados_usuario
ON chamados(usuario_id);

CREATE INDEX IF NOT EXISTS idx_chamados_status
ON chamados(status);

CREATE INDEX IF NOT EXISTS idx_historico_chamado
ON historico_chamados(chamado_id);
