import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event_id, name, title, organization, email, contact_number, linkedin_id, consent_given } = body

  if (!event_id || !name?.trim() || !email?.trim())
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })

  if (!consent_given)
    return NextResponse.json({ error: 'You must accept the terms to register.' }, { status: 400 })

  const admin = await createAdminClient()

  const { data: event, error: eventError } = await admin
    .from('events').select('id, event_name, registration_open, is_active').eq('id', event_id).single()

  if (eventError || !event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  if (!event.is_active || !event.registration_open)
    return NextResponse.json({ error: 'Registration for this event is closed.' }, { status: 403 })

  const { data: existing } = await admin
    .from('invitations').select('id, registration_status').eq('event_id', event_id)
    .eq('email', email.trim().toLowerCase()).maybeSingle()

  if (existing) return NextResponse.json({ duplicate: true, registration_status: existing.registration_status }, { status: 409 })

  const { data, error } = await admin
    .from('invitations')
    .insert({
      event_id, name: name.trim(), title: title || null, organization: organization || null,
      email: email.trim().toLowerCase(), contact_number: contact_number || null,
      linkedin_id: linkedin_id || null, registration_status: 'registered',
      registered_via: 'registration_page', consent_given: true,
    })
    .select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ duplicate: true, registration_status: 'registered' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, event_name: event.event_name }, { status: 201 })
}
