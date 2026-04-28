import { relations, sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
} from 'drizzle-orm/sqlite-core';


export const livros = sqliteTable('livros', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  titulo: text('titulo').notNull(),
  isbn: text('isbn'),
  autor: text('autor').notNull(),
  sinopse: text('sinopse'),
  capaUrl: text('capa_url'),
  indicadoPor: text('indicado_por'),
  mes: text('mes').notNull(),
  ano: integer('ano').notNull(),
  tipo: text('tipo').default('candidato'),
  votos: integer('votos').default(0),
  slug: text('slug').unique().notNull(),
  linkCompra: text('link_compra'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const encontros = sqliteTable('encontros', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  local: text('local'),
  data: integer('data', { mode: 'timestamp' }).notNull(),
  horaInicio: text('hora_inicio'),
  horaFim: text('hora_fim'),
  livroDoMes_id: text('livro_do_mes_id').references(() => livros.id, { onDelete: 'set null' }),
  imagemUrl: text('imagem_url'),
  slug: text('slug').unique(),
  valor: text('valor'),
  telefone: text('telefone'),
  linkInscricao: text('link_inscricao'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const eventoConfirmacoes = sqliteTable('evento_confirmacoes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventoId: text('evento_id').notNull().references(() => encontros.id, { onDelete: 'cascade' }),
  usuarioEmail: text('usuario_email').notNull(),
  status: text('status').notNull().default('vou'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const votacoes = sqliteTable('votacoes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  livro_id: text('livro_id').notNull().references(() => livros.id, { onDelete: 'cascade' }),
  usuario_email: text('usuario_email').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const colaboradoras = sqliteTable('colaboradoras', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('colaboradora'),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).default(true),
  active: integer('active', { mode: 'boolean' }).default(true),
  status: text('status').default('ativa'),
  phone: text('phone'),
  birthdate: integer('birthdate', { mode: 'timestamp' }),
  tempoClube: text('tempo_clube'),
  enderecoCompleto: text('endereco_completo'),
  cartaMimo: integer('carta_mimo', { mode: 'boolean' }).default(false),
  enviosRealizados: integer('envios_realizados').default(0),
  ultimaInteracao: integer('ultima_interacao', { mode: 'timestamp' }),

  // LGPD: consentimento de tratamento de dados
  gdprConsentido: integer('gdpr_consentido', { mode: 'boolean' }).default(false),
  gdprConsentidoEm: integer('gdpr_consentido_em', { mode: 'timestamp' }),
  gdprConsentimentoVersao: text('gdpr_consentimento_versao'),
  gdprConsentimentoFinalidade: text('gdpr_consentimento_finalidade'),
  tempPasswordExpiresAt: integer('temp_password_expires_at', { mode: 'timestamp' }),

  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
});

export const colaboradorasPasswordHistory = sqliteTable('colaboradoras_password_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  colaboradoraId: text('colaboradora_id').notNull().references(() => colaboradoras.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash').notNull(),
  type: text('type').notNull().default('permanent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const permissoesSeccao = sqliteTable('permissoes_seccao', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nomeSecao: text('nome_secao').notNull(),
  usuarioEmail: text('usuario_email').notNull(),
  ativo: integer('ativo', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const parcerias = sqliteTable('parcerias', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  link: text('link'),
  description: text('description'),
  imagem: text('imagem'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const empreendedoras = sqliteTable('empreendedoras', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  feitoPor: text('feito_por'),
  frase: text('frase'),
  categoria: text('categoria'),
  instagram: text('instagram'),
  logoUrl: text('logo_url'),
  website: text('website'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const solicitacoes = sqliteTable('solicitacoes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tipo: text('tipo').notNull(),
  nome: text('nome').notNull(),
  email: text('email').notNull(),
  telefone: text('telefone'),
  site: text('site'),
  instagram: text('instagram'),
  mensagem: text('mensagem'),
  enderecoCompleto: text('endereco_completo'),
  status: text('status').default('pendente'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const escritoras = sqliteTable('escritoras', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text('nome').notNull(),
  livroTitulo: text('livro_titulo').notNull(),
  genero: text('genero'),
  sinopse: text('sinopse'),
  instagram: text('instagram'),
  linkCompra: text('link_compra'),
  capaUrl: text('capa_url'),
  site: text('site'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const cronograma = sqliteTable('cronograma', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  date: text('date'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  ano: integer('ano'),
  status: text('status').default('ativo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const votacaoConfig = sqliteTable('votacao_config', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ativa: integer('ativa', { mode: 'boolean' }).default(false),
  prazo: text('prazo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const votacoesHistorico = sqliteTable('votacoes_historico', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  periodo: text('periodo').notNull(),
  vencedorTitulo: text('vencedor_titulo').notNull(),
  vencedorAutor: text('vencedor_autor').notNull(),
  vencedorVotos: integer('vencedor_votos').default(0),
  totalVotos: integer('total_votos').default(0),
  porcentagem: integer('porcentagem').default(0),
  encerradoEm: integer('encerrado_em', { mode: 'timestamp' }).defaultNow(),
});

export const resenhas = sqliteTable('resenhas', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  book: text('book'),
  author: text('author'),
  content: text('content'),
  rating: integer('rating'),
  imageUrl: text('image_url'),
  publishedAt: text('published_at'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const sorteiosParticipantes = sqliteTable('sorteios_participantes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text('nome').notNull(),
  mesBase: text('mes_base').notNull(), // ex: "2026-04"
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const sorteiosHistorico = sqliteTable('sorteios_historico', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text('nome').notNull(),
  premio: text('premio').notNull(),
  mesBase: text('mes_base').notNull(),
  dataSorteio: integer('data_sorteio', { mode: 'timestamp' }).defaultNow(),
});

export const sorteiosPremios = sqliteTable('sorteios_premios', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  premio: text('premio').notNull(),
  mesBase: text('mes_base').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const sorteiosConfig = sqliteTable('sorteios_config', {
  id: integer('id').primaryKey(),
  mesBase: text('mes_base').notNull(),
  urnaAberta: integer('urna_aberta').default(1).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});

export const podcasts = sqliteTable('podcasts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  titulo: text('titulo').notNull(),
  convidada: text('convidada'),
  duracao: text('duracao'),
  data: text('data'),
  resumo: text('resumo'),
  audioUrl: text('audio_url'),
  spotifyUrl: text('spotify_url'),
  youtubeUrl: text('youtube_url'),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const rodaonline = sqliteTable('rodaonline', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  book: text('book'),
  author: text('author'),
  date: integer('date', { mode: 'timestamp' }),
  link: text('link'),
  description: text('description'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  linkDrive: text('link_drive'),
  status: text('status').default('ativo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const reflexoesRodaOnline = sqliteTable('reflexoes_roda_online', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  rodaId: text('roda_id').notNull(),
  autoraNome: text('autora_nome').notNull(),
  autoraEmail: text('autora_email'),
  texto: text('texto').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const livroDoMes = sqliteTable('livro_do_mes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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
  confirmado: integer('confirmado', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});

export const dicas = sqliteTable('dicas', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoria: text('categoria').default('Leitura'),
  titulo: text('titulo').notNull(),
  descricao: text('descricao').notNull(),
  imagem: text('imagem'),
  textoCompleto: text('texto_completo'),
  iconName: text('icon_name').default('BookOpen'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const leituras = sqliteTable('leituras', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  author: text('author'),
  link: text('link'),
  linkLive: text('link_live'),
  linkDrive: text('link_drive'),
  imageUrl: text('image_url'),
  data: text('data'),
  status: text('status').default('ativo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const reflexoesLobos = sqliteTable('reflexoes_lobos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  leituraId: text('leitura_id').references(() => leituras.id, { onDelete: 'cascade' }),
  autoraNome: text('autora_nome').notNull(),
  autoraEmail: text('autora_email'),
  texto: text('texto').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const comentarios = sqliteTable('comentarios', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  livroDoMesId: text('livro_do_mes_id').references(() => livroDoMes.id, { onDelete: 'cascade' }),
  resenhaId: text('resenha_id').references(() => resenhas.id, { onDelete: 'cascade' }),
  autoraNome: text('autora_nome').notNull(),
  autoraEmail: text('autora_email'),
  texto: text('texto').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const rodaVozes = sqliteTable('roda_vozes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').unique().notNull(),
  titulo: text('titulo').default('Roda de Vozes'),
  status: text('status').default('ativa'), // ativa, pausada, encerrada
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});

export const participantesRodaVozes = sqliteTable('participantes_roda_vozes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  rodaId: text('roda_id').notNull().references(() => rodaVozes.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  ordem: integer('ordem').notNull(),
  falou: integer('falou', { mode: 'boolean' }).default(false),
  tempoUtilizado: integer('tempo_utilizado').default(0),
  minutosAdicionaisUsados: integer('minutos_adicionais_usados').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const configModeracao = sqliteTable('config_moderacao', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  palavrasExtras: text('palavras_extras').default(''),
  palavrasRemovidasBase: text('palavras_removidas_base').default(''),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
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
