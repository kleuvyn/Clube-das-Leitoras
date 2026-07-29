CREATE TABLE `carteirinhas` (
	`id` text PRIMARY KEY NOT NULL,
	`solicitacao_id` text,
	`colaboradora_id` text,
	`url` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacoes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`colaboradora_id`) REFERENCES `colaboradoras`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `colaboradoras_password_history` (
	`id` text PRIMARY KEY NOT NULL,
	`colaboradora_id` text NOT NULL,
	`password_hash` text NOT NULL,
	`type` text DEFAULT 'permanent' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`colaboradora_id`) REFERENCES `colaboradoras`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `produtos` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`image_url` text,
	`category` text NOT NULL,
	`badge` text,
	`stock` integer DEFAULT 0,
	`active` integer DEFAULT true,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `sorteios_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`mes_base` text NOT NULL,
	`urna_aberta` integer DEFAULT 1 NOT NULL,
	`foto_url` text,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `sorteios_premios` (
	`id` text PRIMARY KEY NOT NULL,
	`premio` text NOT NULL,
	`foto_url` text,
	`mes_base` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
ALTER TABLE `colaboradoras` ADD `carteirinha_url` text;--> statement-breakpoint
ALTER TABLE `colaboradoras` ADD `temp_password_expires_at` integer;--> statement-breakpoint
ALTER TABLE `comentarios` ADD `likes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `comentarios` ADD `reply_to_id` text;--> statement-breakpoint
ALTER TABLE `parcerias` ADD `website` text;--> statement-breakpoint
ALTER TABLE `parcerias` ADD `coupon` text;--> statement-breakpoint
ALTER TABLE `reflexoes_roda_online` ADD `likes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reflexoes_roda_online` ADD `reply_to_id` text;--> statement-breakpoint
ALTER TABLE `solicitacoes` ADD `whatsapp` text;--> statement-breakpoint
ALTER TABLE `solicitacoes` ADD `foto_url` text;--> statement-breakpoint
ALTER TABLE `solicitacoes` ADD `carteirinha_url` text;--> statement-breakpoint
ALTER TABLE `solicitacoes` ADD `approved_at` integer;--> statement-breakpoint
ALTER TABLE `sorteios_historico` ADD `foto_url` text;--> statement-breakpoint
ALTER TABLE `votacao_config` ADD `permitir_sugestoes` integer DEFAULT true;