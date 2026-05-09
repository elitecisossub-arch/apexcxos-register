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

  // 1. Look up event
  const { data: event, error: eventError } = await admin
    .from('events')
    .select('id, event_name, registration_open, is_active')
    .eq('id', event_id)
    .single()

  if (eventError || !event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  if (!event.is_active || !event.registration_open)
    return NextResponse.json({ error: 'Registration for this event is closed.' }, { status: 403 })

  const cleanEmail = email.trim().toLowerCase()
  const nowISO = new Date().toISOString()

  // 2. Duplicate check against invite_management for the same event + email
  const { data: existing } = await admin
    .from('invite_management')
    .select('id, response_status, invitation_status')
    .eq('event_name', event.event_name)
    .ilike('email', cleanEmail)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { duplicate: true, registration_status: existing.response_status || existing.invitation_status || 'registered' },
      { status: 409 }
    )
  }

  // 3. Insert into invite_management with the field mapping you described
  const payload = {
    invite_by:          'Self-Registration',         // logo placeholder; admin can change later
    contact_name:       name.trim(),
    email:              cleanEmail,
    phone_number:       contact_number?.trim() || null,
    contact_type:       null,
    event_name:         event.event_name,
    invitation_status:  'Opened',                     // they opened + acted on the link
    invitation_method:  null,
    sent_date:          nowISO,
    sent_by:            null,
    response_status:    null,
    response_date:      null,
    response_channel:   null,
    dietary_requirements: null,
    special_notes:      null,
    followup_required:  null,
    followup_date:      null,
    last_action_date:   nowISO,
    title:              title?.trim() || null,
    organization:       organization?.trim() || null,
    linkedin_id:        linkedin_id?.trim() || null,
  }

  const { data, error } = await admin
    .from('invite_management')
    .insert(payload)
    .select()
    .single()

  if (error) {
    if (error.code === '23505')
      return NextResponse.json({ duplicate: true, registration_status: 'registered' }, { status: 409 })
    console.error('[register] DB error:', error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ data, event_name: event.event_name }, { status: 201 })
}
