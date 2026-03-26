import Link from 'next/link';
import { normalizeDateValue, parseDateValue, formatMonthYear } from '@/lib/utils';

type Resenha = {
  id: string;
  title: string;
  book?: string | null;
  publishedAt?: string | null;
  createdAt: string | number;
};

type SidebarCronologicaProps = {
  todas: Resenha[];
  idAtivo: string;
};

const MESES_PT: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
};

function getDateFromResenha(resenha: Resenha): Date {
  const published = parseDateValue(resenha.publishedAt ?? null)
  if (published) return published
  return normalizeDateValue(resenha.createdAt)
}

function formatDateLabel(resenha: Resenha): string {
  const d = getDateFromResenha(resenha)
  return formatMonthYear(d)
}



export default function SidebarCronologica({ todas = [], idAtivo }: SidebarCronologicaProps) {
  const ordenadas = [...todas].sort((a, b) => getDateFromB(b).getTime() - getDateFromB(a).getTime());

  const porAno = ordenadas.reduce((acc: Record<number, Resenha[]>, resenha) => {
    const ano = getDateFromResenha(resenha).getFullYear();
    if (!acc[ano]) acc[ano] = [];
    acc[ano].push(resenha);
    return acc;
  }, {});

  const anos = Object.keys(porAno).map(Number).sort((a, b) => b - a);

  return (
    <div>
      {anos.map(ano => (
        <div key={ano} className="mb-6">
          <div className="flex items-end justify-between">
            <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-[#2C3E50]">{ano}</h3>
            <span className="text-[10px] uppercase font-bold opacity-50">
              {ano === new Date().getFullYear() ? 'Em curso' : 'Encerrado'}
            </span>
          </div>
          <div className="mt-3 space-y-1">
            {porAno[ano].map((res) => {
              const data = getDateFromResenha(res);
              return (
                <Link
                  key={res.id}
                  href={`/resenhas/${res.id}#comentarios`}
                  className={`block rounded-xl p-2 transition ${res.id === idAtivo ? 'bg-[#f8efdb] border border-[#2C3E50]' : 'bg-white/90 border border-black/10 hover:bg-[#FDFCFB]'}`}
                >
                  <div className="text-[11px] font-bold leading-tight text-[#2C3E50]">{res.title}</div>
                  <div className="text-[9px] text-[#2C3E50] opacity-80">{formatMonthYear(data)}{res.book ? ` • ${res.book}` : ''}</div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function getDateFromB(resenha: Resenha): Date {
  return getDateFromResenha(resenha);
}
