CREATE TABLE `lojinha_config` (
	`id` integer PRIMARY KEY NOT NULL,
	`em_breve` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
