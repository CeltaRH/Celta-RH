const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Banco de dados SQLite
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'celta.db'));

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS vagas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    departamento TEXT,
    descricao TEXT,
    criada_em TEXT DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    vaga TEXT NOT NULL,
    origem TEXT DEFAULT 'E-mail',
    status TEXT DEFAULT 'novo',
    obs TEXT,
    data_cadastro TEXT DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidato_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    criado_em TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE
  );
`);

// ─── VAGAS ───────────────────────────────────────────────

app.get('/api/vagas', (req, res) => {
  const vagas = db.prepare('SELECT * FROM vagas ORDER BY nome').all();
  res.json(vagas);
});

app.post('/api/vagas', (req, res) => {
  const { nome, departamento, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  const result = db.prepare('INSERT INTO vagas (nome, departamento, descricao) VALUES (?, ?, ?)').run(nome, departamento || '', descricao || '');
  res.json({ id: result.lastInsertRowid, nome, departamento, descricao });
});

app.delete('/api/vagas/:id', (req, res) => {
  db.prepare('DELETE FROM vagas WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── CANDIDATOS ──────────────────────────────────────────

app.get('/api/candidatos', (req, res) => {
  const { status, vaga, q } = req.query;
  let sql = 'SELECT * FROM candidatos WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (vaga)   { sql += ' AND vaga = ?';   params.push(vaga); }
  if (q)      { sql += ' AND (nome LIKE ? OR email LIKE ? OR vaga LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ' ORDER BY id DESC';
  const candidatos = db.prepare(sql).all(...params);
  res.json(candidatos);
});

app.post('/api/candidatos', (req, res) => {
  const { nome, phone, email, vaga, origem, obs } = req.body;
  if (!nome || !phone || !vaga) return res.status(400).json({ erro: 'Nome, WhatsApp e vaga são obrigatórios' });
  const result = db.prepare(
    'INSERT INTO candidatos (nome, phone, email, vaga, origem, obs) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(nome, phone, email || '', vaga, origem || 'E-mail', obs || '');
  res.json({ id: result.lastInsertRowid, ...req.body, status: 'novo' });
});

app.put('/api/candidatos/:id', (req, res) => {
  const { status, obs } = req.body;
  const fields = [];
  const params = [];
  if (status !== undefined) { fields.push('status = ?'); params.push(status); }
  if (obs !== undefined)    { fields.push('obs = ?');    params.push(obs); }
  if (!fields.length) return res.status(400).json({ erro: 'Nada para atualizar' });
  params.push(req.params.id);
  db.prepare(`UPDATE candidatos SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  res.json({ ok: true });
});

app.delete('/api/candidatos/:id', (req, res) => {
  db.prepare('DELETE FROM candidatos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── HISTÓRICO ───────────────────────────────────────────

app.get('/api/candidatos/:id/historico', (req, res) => {
  const hist = db.prepare('SELECT * FROM historico WHERE candidato_id = ? ORDER BY id DESC').all(req.params.id);
  res.json(hist);
});

app.post('/api/candidatos/:id/historico', (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ erro: 'Texto obrigatório' });
  const result = db.prepare('INSERT INTO historico (candidato_id, texto) VALUES (?, ?)').run(req.params.id, texto);
  res.json({ id: result.lastInsertRowid, candidato_id: req.params.id, texto });
});

// ─── MÉTRICAS ────────────────────────────────────────────

app.get('/api/metricas', (req, res) => {
  const total     = db.prepare('SELECT COUNT(*) as n FROM candidatos').get().n;
  const novos     = db.prepare("SELECT COUNT(*) as n FROM candidatos WHERE status = 'novo'").get().n;
  const entrevista= db.prepare("SELECT COUNT(*) as n FROM candidatos WHERE status = 'entrevista'").get().n;
  const aprovados = db.prepare("SELECT COUNT(*) as n FROM candidatos WHERE status = 'aprovado'").get().n;
  res.json({ total, novos, entrevista, aprovados });
});

// Rota catch-all → frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => console.log(`Celta RH rodando na porta ${PORT}`));
