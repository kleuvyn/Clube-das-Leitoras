import { NextResponse } from 'next/server'
import postgres from 'postgres'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const connString = process.env.DATABASE_URL
    const sql = postgres(connString)
    const res = await sql`select current_database() as db, current_schema() as schema, current_user as user, current_setting('search_path', true) as search_path`
    await sql.end()
    return NextResponse.json({ info: res[0] })
  } catch (error) {
    console.error('DB debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
