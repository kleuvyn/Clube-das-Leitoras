const { createClient } = require('@libsql/client');
(async () => {
  const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
  const solicitacoes = await client.execute({
    sql: `SELECT id, nome, mensagem, instagram, site, foto_url FROM solicitacoes WHERE lower(email) = lower(?) LIMIT 1`,
    parameters: ['ana.revisora.ana@gmail.com'],
  });
  console.log('solicitacoes count', solicitacoes.rows.length);
  if (solicitacoes.rows.length === 0) return;
  const row = solicitacoes.rows[0];
  const extractMensagemValue = (mensagem, labels) => {
    if (!mensagem) return '';
    const lines = mensagem.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const label of labels) {
        const lowerLabel = `${label.toLowerCase()}:`;
        if (lowerLine.startsWith(lowerLabel)) {
          return line.slice(lowerLabel.length).trim();
        }
      }
    }
    return '';
  };
  const nome = (row.nome || '').trim();
  const livroTitulo = extractMensagemValue(row.mensagem, ['Título do Livro']);
  const genero = extractMensagemValue(row.mensagem, ['Gênero Literário']);
  const linkCompra = extractMensagemValue(row.mensagem, ['Link de Compra']);
  const site = extractMensagemValue(row.mensagem, ['Site / Blog']);
  const sinopse = extractMensagemValue(row.mensagem, ['Sinopse do Livro']);
  const bio = extractMensagemValue(row.mensagem, ['Bio da Escritora']);
  console.log({ nome, livroTitulo, genero, linkCompra, site, sinopse: sinopse.slice(0,80), bio: bio.slice(0,80), foto_url: row.foto_url });
  const insertResult = await client.execute({
    sql: 'INSERT INTO escritoras (nome, livro_titulo, genero, sinopse, instagram, link_compra, capa_url, site, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    parameters: [nome, livroTitulo, genero || null, sinopse || null, row.instagram || null, linkCompra || null, row.foto_url || null, site || row.site || null, bio || null],
  });
  console.log('inserted rowid', insertResult.lastInsertRowid);
})();
