import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm'; 
import { pgTable, text, timestamp, uuid, varchar, boolean, integer } from 'drizzle-orm/pg-core';

export const livros = pgTable('livros', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  isbn: text('isbn'),
  autor: text('autor').notNull(),
  sinopse: text('sinopse'),
  capaUrl: text('capa_url'),
  indicadoPor: text('indicado_por'),
  mes: varchar('mes', { length: 20 }).notNull(),
  ano: integer('ano').notNull(),
  tipo: text('tipo').default('candidato'), 
  votos: integer('votos').default(0),
  slug: text('slug').unique().notNull(),
  linkCompra: text('link_compra'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const encontros = pgTable('encontros', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  local: text('local'),
  data: timestamp('data').notNull(),
  horaInicio: varchar('hora_inicio', { length: 5 }),
  horaFim: varchar('hora_fim', { length: 5 }),
  livroDoMes_id: uuid('livro_do_mes_id').references(() => livros.id, { onDelete: 'set null' }),
  imagemUrl: text('imagem_url'),
  slug: text('slug').unique(),
  valor: text('valor'),
  telefone: text('telefone'),
  linkInscricao: text('link_inscricao'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const eventoConfirmacoes = pgTable('evento_confirmacoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventoId: uuid('evento_id').notNull().references(() => encontros.id, { onDelete: 'cascade' }),
  usuarioEmail: text('usuario_email').notNull(),
  status: text('status').notNull().default('vou'), 
  createdAt: timestamp('created_at').defaultNow(),
});

export const votacoes = pgTable('votacoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  livro_id: uuid('livro_id').notNull().references(() => livros.id, { onDelete: 'cascade' }),
  usuario_email: text('usuario_email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const colaboradoras = pgTable('colaboradoras', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 20 }).default('colaboradora'), 
  mustChangePassword: boolean('must_change_password').default(true),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
});

export const permissoesSeccao = pgTable('permissoes_seccao', {
  id: uuid('id').primaryKey().defaultRandom(),
  nomeSecao: text('nome_secao').notNull(), 
  usuarioEmail: text('usuario_email').notNull(),
  ativo: boolean('ativo').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const parcerias = pgTable('parcerias', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  link: text('link'),
  description: text('description'),
  imagem: text('imagem'), 
  createdAt: timestamp('created_at').defaultNow(),
});

export const empreendedoras = pgTable('empreendedoras', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  feitoPor: text('feito_por'),       
  frase: text('frase'),
  categoria: text('categoria'),
  instagram: text('instagram'),
  logoUrl: text('logo_url'),
  website: text('website'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const escritoras = pgTable('escritoras', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),           
  livroTitulo: text('livro_titulo').notNull(), 
  genero: text('genero'),                 
  sinopse: text('sinopse'),
  instagram: text('instagram'),
  linkCompra: text('link_compra'),
  capaUrl: text('capa_url'),
  site: text('site'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cronograma = pgTable('cronograma', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  date: text('date'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  ano: integer('ano'),
  status: text('status').default('ativo'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const votacaoConfig = pgTable('votacao_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  ativa: boolean('ativa').default(false),
  prazo: text('prazo'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const votacoesHistorico = pgTable('votacoes_historico', {
  id: uuid('id').primaryKey().defaultRandom(),
  periodo: text('periodo').notNull(),
  vencedorTitulo: text('vencedor_titulo').notNull(),
  vencedorAutor: text('vencedor_autor').notNull(),
  vencedorVotos: integer('vencedor_votos').default(0),
  totalVotos: integer('total_votos').default(0),
  porcentagem: integer('porcentagem').default(0),
  encerradoEm: timestamp('encerrado_em').defaultNow(),
});

export const resenhas = pgTable('resenhas', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  book: text('book'),
  author: text('author'),
  content: text('content'),
  rating: integer('rating'),
  imageUrl: text('image_url'),
  publishedAt: text('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const podcasts = pgTable('podcasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  convidada: text('convidada'),
  duracao: text('duracao'),
  data: text('data'),
  resumo: text('resumo'),
  audioUrl: text('audio_url'),
  spotifyUrl: text('spotify_url'),
  youtubeUrl: text('youtube_url'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rodaonline = pgTable('rodaonline', {
  id: text('id').default(sql`gen_random_uuid()`).primaryKey(),
  title: text('title').notNull(),
  book: text('book'),           
  author: text('author'),       
  date: timestamp('date'),
  link: text('link'),
  description: text('description'),
  imageUrl: text('image_url'), 
  videoUrl: text('video_url'), 
  linkDrive: text('link_drive'),
  status: text('status').default('ativo'), 
  createdAt: timestamp('created_at').defaultNow(),
});

export const reflexoesRodaOnline = pgTable('reflexoes_roda_online', {
  id: uuid('id').primaryKey().defaultRandom(),
  rodaId: text('roda_id').notNull(),
  autoraNome: text('autora_nome').notNull(),
  autoraEmail: text('autora_email'),
  texto: text('texto').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const livroDoMes = pgTable('livro_do_mes', {
  id: uuid('id').primaryKey().defaultRandom(),
  mes: text('mes'),
  num: integer('num'),
  ano: integer('ano'),
  livro: text('livro'),
  autora: text('autora'),
  foto: text('foto'),
  sinopse: text('sinopse'),
  tag: text('tag'),
  diaEncontro: text('dia_encontro'),
  horarioEncontro: text('horario_encontro'),
  confirmado: boolean('confirmado').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dicas = pgTable('dicas', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoria: text('categoria').default('Leitura'),
  titulo: text('titulo').notNull(),
  descricao: text('descricao').notNull(),
  imagem: text('imagem'), 
  textoCompleto: text('texto_completo'),
  iconName: text('icon_name').default('BookOpen'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leituras = pgTable('leituras', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  author: text('author'),
  link: text('link'),
  linkLive: text('link_live'),
  linkDrive: text('link_drive'),
  imageUrl: text('image_url'),
  data: text('data'),
  status: text('status').default('ativo'), 
  createdAt: timestamp('created_at').defaultNow(),
});

export const reflexoesLobos = pgTable('reflexoes_lobos', {
  id: uuid('id').primaryKey().defaultRandom(),
  leituraId: uuid('leitura_id').references(() => leituras.id, { onDelete: 'cascade' }),
  autoraNome: text('autora_nome').notNull(),
  autoraEmail: text('autora_email'),
  texto: text('texto').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comentarios = pgTable('comentarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  livroDoMesId: uuid('livro_do_mes_id').references(() => livroDoMes.id, { onDelete: 'cascade' }),
  resenhaId: uuid('resenha_id').references(() => resenhas.id, { onDelete: 'cascade' }),
  autoraNome: text('autora_nome').notNull(),
  autoraEmail: text('autora_email'),
  texto: text('texto').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const configModeracao = pgTable('config_moderacao', {
  id: uuid('id').primaryKey().defaultRandom(),
  palavrasExtras: text('palavras_extras').default(''),
  palavrasRemovidasBase: text('palavras_removidas_base').default(''),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const livrosRelations = relations(livros, ({ many }) => ({
  votacoes: many(votacoes),
}));

export const votacoesRelations = relations(votacoes, ({ one }) => ({
  livro: one(livros, {
    fields: [votacoes.livro_id],
    references: [livros.id],
  }),
}));
