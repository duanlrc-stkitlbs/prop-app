interface Env {
  DB: D1Database
  UPLOADS_BUCKET?: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 Database binding not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { results } = await db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all()
    const properties = (results || []).map((p: any) => ({
      ...p,
      units: p.units ? JSON.parse(p.units) : [],
      contactIds: p.contact_ids ? JSON.parse(p.contact_ids) : [],
      rentalIncome: p.rental_income,
      colorTheme: p.color_theme,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))

    return new Response(JSON.stringify(properties), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
