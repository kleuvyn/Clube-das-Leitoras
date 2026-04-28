CREATE TABLE `colaboradoras` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`role` text DEFAULT 'colaboradora',
	`must_change_password` integer DEFAULT true,
	`active` integer DEFAULT true,
	`status` text DEFAULT 'ativa',
	`phone` text,
	`birthdate` integer,
	`tempo_clube` text,
	`endereco_completo` text,
	`carta_mimo` integer DEFAULT false,
	`envios_realizados` integer DEFAULT 0,
	`ultima_interacao` integer,
	`gdpr_consentido` integer DEFAULT false,
	`gdpr_consentido_em` integer,
	`gdpr_consentimento_versao` text,
	`gdpr_consentimento_finalidade` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`last_login` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `colaboradoras_email_unique` ON `colaboradoras` (`email`);--> statement-breakpoint
CREATE TABLE `comentarios` (
	`id` text PRIMARY KEY NOT NULL,
	`livro_do_mes_id` text,
	`resenha_id` text,
	`autora_nome` text NOT NULL,
	`autora_email` text,
	`texto` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`livro_do_mes_id`) REFERENCES `livro_do_mes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resenha_id`) REFERENCES `resenhas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `config_moderacao` (
	`id` text PRIMARY KEY NOT NULL,
	`palavras_extras` text DEFAULT '',
	`palavras_removidas_base` text DEFAULT '',
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `cronograma` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`notes` text,
	`image_url` text,
	`ano` integer,
	`status` text DEFAULT 'ativo',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `dicas` (
	`id` text PRIMARY KEY NOT NULL,
	`categoria` text DEFAULT 'Leitura',
	`titulo` text NOT NULL,
	`descricao` text NOT NULL,
	`imagem` text,
	`texto_completo` text,
	`icon_name` text DEFAULT 'BookOpen',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `empreendedoras` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`feito_por` text,
	`frase` text,
	`categoria` text,
	`instagram` text,
	`logo_url` text,
	`website` text,
	`bio` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `encontros` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text,
	`local` text,
	`data` integer NOT NULL,
	`hora_inicio` text,
	`hora_fim` text,
	`livro_do_mes_id` text,
	`imagem_url` text,
	`slug` text,
	`valor` text,
	`telefone` text,
	`link_inscricao` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`livro_do_mes_id`) REFERENCES `livros`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `encontros_slug_unique` ON `encontros` (`slug`);--> statement-breakpoint
CREATE TABLE `escritoras` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`livro_titulo` text NOT NULL,
	`genero` text,
	`sinopse` text,
	`instagram` text,
	`link_compra` text,
	`capa_url` text,
	`site` text,
	`bio` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `evento_confirmacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`evento_id` text NOT NULL,
	`usuario_email` text NOT NULL,
	`status` text DEFAULT 'vou' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`evento_id`) REFERENCES `encontros`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leituras` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`link` text,
	`link_live` text,
	`link_drive` text,
	`image_url` text,
	`data` text,
	`status` text DEFAULT 'ativo',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `livro_do_mes` (
	`id` text PRIMARY KEY NOT NULL,
	`mes` text,
	`num` integer,
	`ano` integer,
	`livro` text,
	`autora` text,
	`foto` text,
	`sinopse` text,
	`tag` text,
	`dia_encontro` text,
	`horario_encontro` text,
	`confirmado` integer DEFAULT false,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `livros` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`isbn` text,
	`autor` text NOT NULL,
	`sinopse` text,
	`capa_url` text,
	`indicado_por` text,
	`mes` text NOT NULL,
	`ano` integer NOT NULL,
	`tipo` text DEFAULT 'candidato',
	`votos` integer DEFAULT 0,
	`slug` text NOT NULL,
	`link_compra` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `livros_slug_unique` ON `livros` (`slug`);--> statement-breakpoint
CREATE TABLE `parcerias` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`link` text,
	`description` text,
	`imagem` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `participantes_roda_vozes` (
	`id` text PRIMARY KEY NOT NULL,
	`roda_id` text NOT NULL,
	`nome` text NOT NULL,
	`ordem` integer NOT NULL,
	`falou` integer DEFAULT false,
	`tempo_utilizado` integer DEFAULT 0,
	`minutos_adicionais_usados` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`roda_id`) REFERENCES `roda_vozes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `permissoes_seccao` (
	`id` text PRIMARY KEY NOT NULL,
	`nome_secao` text NOT NULL,
	`usuario_email` text NOT NULL,
	`ativo` integer DEFAULT false,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `podcasts` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`convidada` text,
	`duracao` text,
	`data` text,
	`resumo` text,
	`audio_url` text,
	`spotify_url` text,
	`youtube_url` text,
	`image_url` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `reflexoes_lobos` (
	`id` text PRIMARY KEY NOT NULL,
	`leitura_id` text,
	`autora_nome` text NOT NULL,
	`autora_email` text,
	`texto` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`leitura_id`) REFERENCES `leituras`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reflexoes_roda_online` (
	`id` text PRIMARY KEY NOT NULL,
	`roda_id` text NOT NULL,
	`autora_nome` text NOT NULL,
	`autora_email` text,
	`texto` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `resenhas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`book` text,
	`author` text,
	`content` text,
	`rating` integer,
	`image_url` text,
	`published_at` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `roda_vozes` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`titulo` text DEFAULT 'Roda de Vozes',
	`status` text DEFAULT 'ativa',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roda_vozes_session_id_unique` ON `roda_vozes` (`session_id`);--> statement-breakpoint
CREATE TABLE `rodaonline` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`book` text,
	`author` text,
	`date` integer,
	`link` text,
	`description` text,
	`image_url` text,
	`video_url` text,
	`link_drive` text,
	`status` text DEFAULT 'ativo',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `solicitacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`nome` text NOT NULL,
	`email` text NOT NULL,
	`telefone` text,
	`site` text,
	`instagram` text,
	`mensagem` text,
	`endereco_completo` text,
	`status` text DEFAULT 'pendente',
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `sorteios_historico` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`premio` text NOT NULL,
	`mes_base` text NOT NULL,
	`data_sorteio` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `sorteios_participantes` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`mes_base` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `votacao_config` (
	`id` text PRIMARY KEY NOT NULL,
	`ativa` integer DEFAULT false,
	`prazo` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `votacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`livro_id` text NOT NULL,
	`usuario_email` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`livro_id`) REFERENCES `livros`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `votacoes_historico` (
	`id` text PRIMARY KEY NOT NULL,
	`periodo` text NOT NULL,
	`vencedor_titulo` text NOT NULL,
	`vencedor_autor` text NOT NULL,
	`vencedor_votos` integer DEFAULT 0,
	`total_votos` integer DEFAULT 0,
	`porcentagem` integer DEFAULT 0,
	`encerrado_em` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
