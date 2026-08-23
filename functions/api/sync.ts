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

    const [propsRes, expRes, snagRes, contactsRes, vaultRes, notesRes] = await Promise.all([
      db.prepare('SELECT * FROM properties').all(),
      db.prepare('SELECT * FROM expenses').all(),
      db.prepare('SELECT * FROM snags').all(),
      db.prepare('SELECT * FROM contacts').all(),
      db.prepare('SELECT * FROM vault_items').all(),
      db.prepare('SELECT * FROM notes').all()
    ])

    const properties = (propsRes.results || []).map((p: any) => ({
      ...p,
      units: p.units ? JSON.parse(p.units) : [],
      contactIds: p.contact_ids ? JSON.parse(p.contact_ids) : [],
      rentalIncome: p.rental_income,
      colorTheme: p.color_theme,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))

    const expenses = (expRes.results || []).map((e: any) => ({
      ...e,
      propertyId: e.property_id,
      dueDay: e.due_day,
      isPaid: Boolean(e.is_paid),
      lastPaidDate: e.last_paid_date,
      accountReference: e.account_reference
    }))

    const snags = (snagRes.results || []).map((s: any) => ({
      ...s,
      propertyId: s.property_id,
      assignedContactId: s.assigned_contact_id,
      costEstimate: s.cost_estimate,
      actualCost: s.actual_cost,
      createdAt: s.created_at,
      resolvedAt: s.resolved_at
    }))

    const contacts = (contactsRes.results || []).map((c: any) => ({
      ...c,
      whatsappPhone: c.whatsapp_phone,
      isEmergencyContact: Boolean(c.is_emergency_contact),
      propertyIds: c.property_ids ? JSON.parse(c.property_ids) : []
    }))

    const vault = (vaultRes.results || []).map((v: any) => ({
      ...v,
      propertyId: v.property_id,
      isSecret: Boolean(v.is_secret)
    }))

    const notes = (notesRes.results || []).map((n: any) => ({
      ...n,
      propertyId: n.property_id,
      createdAt: n.created_at
    }))

    return new Response(
      JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        properties,
        expenses,
        snags,
        contacts,
        vault,
        notes
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 Database binding not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payload = await context.request.json() as any
    const { properties = [], expenses = [], snags = [], contacts = [], vault = [], notes = [] } = payload

    const batchStatements: any[] = []

    // Upsert properties
    for (const p of properties) {
      batchStatements.push(
        db.prepare(
          `INSERT INTO properties (id, name, nickname, address, units, status, type, rental_income, color_theme, contact_ids, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, nickname=excluded.nickname, address=excluded.address, units=excluded.units,
             status=excluded.status, type=excluded.type, rental_income=excluded.rental_income,
             color_theme=excluded.color_theme, contact_ids=excluded.contact_ids, updated_at=excluded.updated_at`
        ).bind(
          p.id,
          p.name,
          p.nickname || null,
          p.address,
          JSON.stringify(p.units || []),
          p.status || 'Active',
          p.type || 'Residential',
          p.rentalIncome || null,
          p.colorTheme || null,
          JSON.stringify(p.contactIds || []),
          p.createdAt || new Date().toISOString(),
          p.updatedAt || new Date().toISOString()
        )
      )
    }

    // Upsert expenses
    for (const e of expenses) {
      batchStatements.push(
        db.prepare(
          `INSERT INTO expenses (id, property_id, name, category, amount, frequency, due_day, is_paid, last_paid_date, account_reference, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             property_id=excluded.property_id, name=excluded.name, category=excluded.category, amount=excluded.amount,
             frequency=excluded.frequency, due_day=excluded.due_day, is_paid=excluded.is_paid,
             last_paid_date=excluded.last_paid_date, account_reference=excluded.account_reference, notes=excluded.notes`
        ).bind(
          e.id,
          e.propertyId,
          e.name,
          e.category,
          e.amount,
          e.frequency || 'Monthly',
          e.dueDay || 1,
          e.isPaid ? 1 : 0,
          e.lastPaidDate || null,
          e.accountReference || null,
          e.notes || null
        )
      )
    }

    // Upsert snags
    for (const s of snags) {
      batchStatements.push(
        db.prepare(
          `INSERT INTO snags (id, property_id, title, area, severity, status, assigned_contact_id, cost_estimate, actual_cost, created_at, resolved_at, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             property_id=excluded.property_id, title=excluded.title, area=excluded.area, severity=excluded.severity,
             status=excluded.status, assigned_contact_id=excluded.assigned_contact_id, cost_estimate=excluded.cost_estimate,
             actual_cost=excluded.actual_cost, resolved_at=excluded.resolved_at, notes=excluded.notes`
        ).bind(
          s.id,
          s.propertyId,
          s.title,
          s.area,
          s.severity || 'Normal',
          s.status || 'Open',
          s.assignedContactId || null,
          s.costEstimate || null,
          s.actualCost || null,
          s.createdAt || new Date().toISOString(),
          s.resolvedAt || null,
          s.notes || null
        )
      )
    }

    // Upsert contacts
    for (const c of contacts) {
      batchStatements.push(
        db.prepare(
          `INSERT INTO contacts (id, name, role, phone, whatsapp_phone, email, company, notes, rating, is_emergency_contact, property_ids)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, role=excluded.role, phone=excluded.phone, whatsapp_phone=excluded.whatsapp_phone,
             email=excluded.email, company=excluded.company, notes=excluded.notes, rating=excluded.rating,
             is_emergency_contact=excluded.is_emergency_contact, property_ids=excluded.property_ids`
        ).bind(
          c.id,
          c.name,
          c.role,
          c.phone,
          c.whatsappPhone || null,
          c.email || null,
          c.company || null,
          c.notes || null,
          c.rating || 5,
          c.isEmergencyContact ? 1 : 0,
          JSON.stringify(c.propertyIds || [])
        )
      )
    }

    // Upsert vault items
    for (const v of vault) {
      batchStatements.push(
        db.prepare(
          `INSERT INTO vault_items (id, property_id, label, value, category, is_secret, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             property_id=excluded.property_id, label=excluded.label, value=excluded.value, category=excluded.category,
             is_secret=excluded.is_secret, notes=excluded.notes`
        ).bind(
          v.id,
          v.propertyId,
          v.label,
          v.value,
          v.category || 'Meter',
          v.isSecret ? 1 : 0,
          v.notes || null
        )
      )
    }

    // Upsert notes
    for (const n of notes) {
      batchStatements.push(
        db.prepare(
          `INSERT INTO notes (id, property_id, title, content, category, created_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             property_id=excluded.property_id, title=excluded.title, content=excluded.content, category=excluded.category`
        ).bind(
          n.id,
          n.propertyId,
          n.title,
          n.content,
          n.category || 'General',
          n.createdAt || new Date().toISOString()
        )
      )
    }

    if (batchStatements.length > 0) {
      await db.batch(batchStatements)
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncedRecords: batchStatements.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
