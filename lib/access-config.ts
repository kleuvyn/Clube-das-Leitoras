export type NavIconKey =
  | 'book'
  | 'bookMarked'
  | 'users'
  | 'calendar'
  | 'vote'
  | 'lightbulb'
  | 'podcast';

export interface NavAccessItem {
  href: string;
  label: string;
  icon: NavIconKey;
  color: string;
}

export const PUBLIC_NAV_ITEMS: NavAccessItem[] = [
  { href: '/', label: 'Início', icon: 'book', color: 'text-slate-400' },
  { href: '/empreendedoras', label: 'Empreendedoras', icon: 'users', color: 'text-blue-300' },
];

export const CONVIDADA_EXTRA_NAV_ITEMS: NavAccessItem[] = [
  { href: '/livro-do-mes', label: 'Livros do Mês', icon: 'bookMarked', color: 'text-rose-300' },
  { href: '/cronograma', label: 'Cronograma', icon: 'calendar', color: 'text-emerald-300' },
  { href: '/votacao', label: 'Votacao do Mes', icon: 'vote', color: 'text-cyan-300' },
  { href: '/dicas', label: 'Dicas da Gabi', icon: 'lightbulb', color: 'text-amber-300' },
  { href: '/podcast', label: 'Podcast', icon: 'podcast', color: 'text-orange-300' },
];

export const CONVIDADA_PROTECTED_ROUTES = [
  '/clube',
  '/leitura',
  '/resenhas',
  '/votacao',
  '/rodaonline',
  '/cronograma',
  '/podcast',
  '/eventos',
];

export const ADMIN_ROUTE_PREFIX = '/admin';
