import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';
import { colaboradoras } from '@/lib/db/schema';

export async function GET() {
  try {
    const user = await requireMember();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao exportar dados' }, { status: error?.status ?? 500 });
  }
}
