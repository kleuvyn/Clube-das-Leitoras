import { sqliteTable, AnySQLiteColumn, uniqueIndex, text, integer, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const colaboradoras = sqliteTable("colaboradoras", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	name: text(),
	avatarUrl: text("avatar_url"),
	role: text().default("colaboradora"),
	mustChangePassword: integer("must_change_password").default(true),
	active: integer().default(true),
	status: text().default("ativa"),
	phone: text(),
	birthdate: integer(),
	tempoClube: text("tempo_clube"),
	enderecoCompleto: text("endereco_completo"),
	cartaMimo: integer("carta_mimo").default(false),
	enviosRealizados: integer("envios_realizados").default(0),
	ultimaInteracao: integer("ultima_interacao"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	lastLogin: integer("last_login"),
	gdprConsentido: integer("gdpr_consentido").default(false),
	gdprConsentidoEm: integer("gdpr_consentido_em"),
	gdprConsentimentoVersao: text("gdpr_consentimento_versao"),
	gdprConsentimentoFinalidade: text("gdpr_consentimento_finalidade"),
	tempPasswordExpiresAt: integer("temp_password_expires_at"),
	carteirinhaUrl: text("carteirinha_url"),
},
(table) => [
	uniqueIndex("colaboradoras_email_unique").on(table.email),
]);

export const comentarios = sqliteTable("comentarios", {
	id: text().primaryKey().notNull(),
	livroDoMesId: text("livro_do_mes_id").references(() => livroDoMes.id, { onDelete: "cascade" } ),
	resenhaId: text("resenha_id").references(() => resenhas.id, { onDelete: "cascade" } ),
	autoraNome: text("autora_nome").notNull(),
	autoraEmail: text("autora_email"),
	texto: text().notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	likes: integer().default(0).notNull(),
	replyToId: text("reply_to_id"),
});

export const configModeracao = sqliteTable("config_moderacao", {
	id: text().primaryKey().notNull(),
	palavrasExtras: text("palavras_extras").default(""),
	palavrasRemovidasBase: text("palavras_removidas_base").default(""),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const cronograma = sqliteTable("cronograma", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	date: text(),
	notes: text(),
	imageUrl: text("image_url"),
	ano: integer(),
	status: text().default("ativo"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const dicas = sqliteTable("dicas", {
	id: text().primaryKey().notNull(),
	categoria: text().default("Leitura"),
	titulo: text().notNull(),
	descricao: text().notNull(),
	imagem: text(),
	textoCompleto: text("texto_completo"),
	iconName: text("icon_name").default("BookOpen"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const empreendedoras = sqliteTable("empreendedoras", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	feitoPor: text("feito_por"),
	frase: text(),
	categoria: text(),
	instagram: text(),
	logoUrl: text("logo_url"),
	website: text(),
	bio: text(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const encontros = sqliteTable("encontros", {
	id: text().primaryKey().notNull(),
	titulo: text().notNull(),
	descricao: text(),
	local: text(),
	data: integer().notNull(),
	horaInicio: text("hora_inicio"),
	horaFim: text("hora_fim"),
	livroDoMesId: text("livro_do_mes_id").references(() => livros.id, { onDelete: "set null" } ),
	imagemUrl: text("imagem_url"),
	slug: text(),
	valor: text(),
	telefone: text(),
	linkInscricao: text("link_inscricao"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
},
(table) => [
	uniqueIndex("encontros_slug_unique").on(table.slug),
]);

export const escritoras = sqliteTable("escritoras", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	livroTitulo: text("livro_titulo").notNull(),
	genero: text(),
	sinopse: text(),
	instagram: text(),
	linkCompra: text("link_compra"),
	capaUrl: text("capa_url"),
	site: text(),
	bio: text(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const eventoConfirmacoes = sqliteTable("evento_confirmacoes", {
	id: text().primaryKey().notNull(),
	eventoId: text("evento_id").notNull().references(() => encontros.id, { onDelete: "cascade" } ),
	usuarioEmail: text("usuario_email").notNull(),
	status: text().default("vou").notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const leituras = sqliteTable("leituras", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	author: text(),
	link: text(),
	linkLive: text("link_live"),
	linkDrive: text("link_drive"),
	imageUrl: text("image_url"),
	data: text(),
	status: text().default("ativo"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const livroDoMes = sqliteTable("livro_do_mes", {
	id: text().primaryKey().notNull(),
	mes: text(),
	num: integer(),
	ano: integer(),
	livro: text(),
	autora: text(),
	foto: text(),
	sinopse: text(),
	tag: text(),
	diaEncontro: text("dia_encontro"),
	horarioEncontro: text("horario_encontro"),
	confirmado: integer().default(false),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const livros = sqliteTable("livros", {
	id: text().primaryKey().notNull(),
	titulo: text().notNull(),
	isbn: text(),
	autor: text().notNull(),
	sinopse: text(),
	capaUrl: text("capa_url"),
	indicadoPor: text("indicado_por"),
	mes: text().notNull(),
	ano: integer().notNull(),
	tipo: text().default("candidato"),
	votos: integer().default(0),
	slug: text().notNull(),
	linkCompra: text("link_compra"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
},
(table) => [
	uniqueIndex("livros_slug_unique").on(table.slug),
]);

export const parcerias = sqliteTable("parcerias", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	link: text(),
	description: text(),
	imagem: text(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	website: text(),
	coupon: text(),
});

export const permissoesSeccao = sqliteTable("permissoes_seccao", {
	id: text().primaryKey().notNull(),
	nomeSecao: text("nome_secao").notNull(),
	usuarioEmail: text("usuario_email").notNull(),
	ativo: integer().default(false),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const podcasts = sqliteTable("podcasts", {
	id: text().primaryKey().notNull(),
	titulo: text().notNull(),
	convidada: text(),
	duracao: text(),
	data: text(),
	resumo: text(),
	audioUrl: text("audio_url"),
	spotifyUrl: text("spotify_url"),
	youtubeUrl: text("youtube_url"),
	imageUrl: text("image_url"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const reflexoesLobos = sqliteTable("reflexoes_lobos", {
	id: text().primaryKey().notNull(),
	leituraId: text("leitura_id").references(() => leituras.id, { onDelete: "cascade" } ),
	autoraNome: text("autora_nome").notNull(),
	autoraEmail: text("autora_email"),
	texto: text().notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const reflexoesRodaOnline = sqliteTable("reflexoes_roda_online", {
	id: text().primaryKey().notNull(),
	rodaId: text("roda_id").notNull(),
	autoraNome: text("autora_nome").notNull(),
	autoraEmail: text("autora_email"),
	texto: text().notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	likes: integer().default(0).notNull(),
	replyToId: text("reply_to_id"),
});

export const resenhas = sqliteTable("resenhas", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	book: text(),
	author: text(),
	content: text(),
	rating: integer(),
	imageUrl: text("image_url"),
	publishedAt: text("published_at"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const rodaonline = sqliteTable("rodaonline", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	book: text(),
	author: text(),
	date: integer(),
	link: text(),
	description: text(),
	imageUrl: text("image_url"),
	videoUrl: text("video_url"),
	linkDrive: text("link_drive"),
	status: text().default("ativo"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const solicitacoes = sqliteTable("solicitacoes", {
	id: text().primaryKey().notNull(),
	tipo: text().notNull(),
	nome: text().notNull(),
	email: text().notNull(),
	telefone: text(),
	site: text(),
	instagram: text(),
	mensagem: text(),
	enderecoCompleto: text("endereco_completo"),
	status: text().default("pendente"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	approvedAt: integer("approved_at"),
	whatsapp: text(),
	fotoUrl: text("foto_url"),
	carteirinhaUrl: text("carteirinha_url"),
});

export const votacaoConfig = sqliteTable("votacao_config", {
	id: text().primaryKey().notNull(),
	ativa: integer().default(false),
	prazo: text(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	permitirSugestoes: integer("permitir_sugestoes").default(true),
});

export const votacoes = sqliteTable("votacoes", {
	id: text().primaryKey().notNull(),
	livroId: text("livro_id").notNull().references(() => livros.id, { onDelete: "cascade" } ),
	usuarioEmail: text("usuario_email").notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const votacoesHistorico = sqliteTable("votacoes_historico", {
	id: text().primaryKey().notNull(),
	periodo: text().notNull(),
	vencedorTitulo: text("vencedor_titulo").notNull(),
	vencedorAutor: text("vencedor_autor").notNull(),
	vencedorVotos: integer("vencedor_votos").default(0),
	totalVotos: integer("total_votos").default(0),
	porcentagem: integer().default(0),
	encerradoEm: integer("encerrado_em").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const participantesRodaVozes = sqliteTable("participantes_roda_vozes", {
	id: text().primaryKey().notNull(),
	rodaId: text("roda_id").notNull().references(() => rodaVozes.id, { onDelete: "cascade" } ),
	nome: text().notNull(),
	ordem: integer().notNull(),
	falou: integer().default(false),
	tempoUtilizado: integer("tempo_utilizado").default(0),
	minutosAdicionaisUsados: integer("minutos_adicionais_usados").default(0),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const rodaVozes = sqliteTable("roda_vozes", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	titulo: text().default("Roda de Vozes"),
	status: text().default("ativa"),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
},
(table) => [
	uniqueIndex("roda_vozes_session_id_unique").on(table.sessionId),
]);

export const sorteiosHistorico = sqliteTable("sorteios_historico", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	premio: text().notNull(),
	mesBase: text("mes_base").notNull(),
	dataSorteio: integer("data_sorteio").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	fotoUrl: text("foto_url"),
});

export const sorteiosParticipantes = sqliteTable("sorteios_participantes", {
	id: text().primaryKey().notNull(),
	nome: text().notNull(),
	mesBase: text("mes_base").notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const colaboradorasPasswordHistory = sqliteTable("colaboradoras_password_history", {
	id: text().primaryKey().notNull(),
	colaboradoraId: text("colaboradora_id").notNull().references(() => colaboradoras.id, { onDelete: "cascade" } ),
	passwordHash: text("password_hash").notNull(),
	type: text().default("permanent").notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const sorteiosPremios = sqliteTable("sorteios_premios", {
	id: text().primaryKey().notNull(),
	premio: text().notNull(),
	mesBase: text("mes_base").notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	fotoUrl: text("foto_url"),
});

export const sorteiosConfig = sqliteTable("sorteios_config", {
	id: integer().primaryKey().notNull(),
	mesBase: text("mes_base").notNull(),
	urnaAberta: integer("urna_aberta").default(1).notNull(),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
	fotoUrl: text("foto_url"),
});

export const carteirinhas = sqliteTable("carteirinhas", {
	id: text().primaryKey().notNull(),
	solicitacaoId: text("solicitacao_id").references(() => solicitacoes.id, { onDelete: "cascade" } ),
	colaboradoraId: text("colaboradora_id").references(() => colaboradoras.id, { onDelete: "set null" } ),
	url: text().notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const produtos = sqliteTable("produtos", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: integer().notNull(),
	imageUrl: text("image_url"),
	category: text().notNull(),
	badge: text(),
	stock: integer().default(0),
	active: integer().default(true),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

export const lojinhaConfig = sqliteTable("lojinha_config", {
	id: integer().primaryKey().notNull(),
	emBreve: integer("em_breve").default(true).notNull(),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`),
});

