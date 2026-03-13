export type ModerationResult = {
  score: number;
  blocked: boolean;
  triggers: string[];
};

export const BLOCKED_TERMS = [
  'porra',
  'caralho',
  'merda',
  'puta',
  'otario',
  'otária',
  'idiota',
  'burro',
  'burra',
  'desgraça',
  'vagabunda',
  'vagabundo',
  'racista',
  'nazista',
  'macaco',
  'retardado',
  'retardada',
  'fdp',
  'fdp.',
  'filho da puta',
  'bosta',
  'lixo humano',
  'matar',
  'morre',
  'morrer',
];

function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function analyzeContentModeration(text: string, extraTerms: string[] = []): ModerationResult {
  const normalized = normalize(text || '');
  const allTerms = [...BLOCKED_TERMS, ...extraTerms.map(t => t.trim()).filter(Boolean)];
  const triggers = allTerms.filter((term) => normalized.includes(normalize(term)));

  
  const score = Math.min(100, triggers.length * 35);

  return {
    score,
    blocked: triggers.length > 0,
    triggers,
  };
}
