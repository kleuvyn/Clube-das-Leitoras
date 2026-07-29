import { relations } from "drizzle-orm/relations";
import { resenhas, comentarios, livroDoMes, livros, encontros, eventoConfirmacoes, leituras, reflexoesLobos, votacoes, rodaVozes, participantesRodaVozes, colaboradoras, colaboradorasPasswordHistory, carteirinhas, solicitacoes } from "./schema";

export const comentariosRelations = relations(comentarios, ({one}) => ({
	resenha: one(resenhas, {
		fields: [comentarios.resenhaId],
		references: [resenhas.id]
	}),
	livroDoMe: one(livroDoMes, {
		fields: [comentarios.livroDoMesId],
		references: [livroDoMes.id]
	}),
}));

export const resenhasRelations = relations(resenhas, ({many}) => ({
	comentarios: many(comentarios),
}));

export const livroDoMesRelations = relations(livroDoMes, ({many}) => ({
	comentarios: many(comentarios),
}));

export const encontrosRelations = relations(encontros, ({one, many}) => ({
	livro: one(livros, {
		fields: [encontros.livroDoMesId],
		references: [livros.id]
	}),
	eventoConfirmacoes: many(eventoConfirmacoes),
}));

export const livrosRelations = relations(livros, ({many}) => ({
	encontros: many(encontros),
	votacoes: many(votacoes),
}));

export const eventoConfirmacoesRelations = relations(eventoConfirmacoes, ({one}) => ({
	encontro: one(encontros, {
		fields: [eventoConfirmacoes.eventoId],
		references: [encontros.id]
	}),
}));

export const reflexoesLobosRelations = relations(reflexoesLobos, ({one}) => ({
	leitura: one(leituras, {
		fields: [reflexoesLobos.leituraId],
		references: [leituras.id]
	}),
}));

export const leiturasRelations = relations(leituras, ({many}) => ({
	reflexoesLobos: many(reflexoesLobos),
}));

export const votacoesRelations = relations(votacoes, ({one}) => ({
	livro: one(livros, {
		fields: [votacoes.livroId],
		references: [livros.id]
	}),
}));

export const participantesRodaVozesRelations = relations(participantesRodaVozes, ({one}) => ({
	rodaVoze: one(rodaVozes, {
		fields: [participantesRodaVozes.rodaId],
		references: [rodaVozes.id]
	}),
}));

export const rodaVozesRelations = relations(rodaVozes, ({many}) => ({
	participantesRodaVozes: many(participantesRodaVozes),
}));

export const colaboradorasPasswordHistoryRelations = relations(colaboradorasPasswordHistory, ({one}) => ({
	colaboradora: one(colaboradoras, {
		fields: [colaboradorasPasswordHistory.colaboradoraId],
		references: [colaboradoras.id]
	}),
}));

export const colaboradorasRelations = relations(colaboradoras, ({many}) => ({
	colaboradorasPasswordHistories: many(colaboradorasPasswordHistory),
	carteirinhas: many(carteirinhas),
}));

export const carteirinhasRelations = relations(carteirinhas, ({one}) => ({
	colaboradora: one(colaboradoras, {
		fields: [carteirinhas.colaboradoraId],
		references: [colaboradoras.id]
	}),
	solicitacoe: one(solicitacoes, {
		fields: [carteirinhas.solicitacaoId],
		references: [solicitacoes.id]
	}),
}));

export const solicitacoesRelations = relations(solicitacoes, ({many}) => ({
	carteirinhas: many(carteirinhas),
}));