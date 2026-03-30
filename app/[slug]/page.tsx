import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import RegistrationForm from '@/components/RegistrationForm'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const admin = await createAdminClient()
  const { data } = await admin
    .from('events')
    .select('event_name')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()
  return { title: data ? `Register — ${data.event_name}` : 'Event Registration' }
}

export default async function RegisterPage({ params }: Props) {
  const admin = await createAdminClient()
  const { data: event } = await admin
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!event) notFound()
  const isOpen = event.registration_open

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2447] via-[#1B3A6B] to-[#0f2447]">
      {event.event_banner_url && (
        <div className="w-full max-h-64 overflow-hidden">
          <img src={event.event_banner_url} alt={event.event_name} className="w-full object-cover" />
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-[#1B3A6B] px-6 py-5">
            <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-1">
              {event.organizer_line || 'ApexCXOs'}
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">{event.event_name}</h1>
          </div>
          <div className="px-6 py-5 space-y-3 border-b border-gray-100">
            {event.event_date && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-4 h-4 text-[#1B3A6B] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.event_date)}{event.event_time && ` · ${event.event_time}`}</span>
              </div>
            )}
            {event.event_venue && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-4 h-4 text-[#1B3A6B] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.event_venue}</span>
              </div>
            )}
          </div>
          {event.event_description && (
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-sm text-gray-600 whitespace-pre-line">{event.event_description}</p>
            </div>
          )}
          {event.event_highlights && event.event_highlights.length > 0 && (
            <div className="px-6 py-5">
              <h2 className="text-sm font-semibold text-[#1B3A6B] uppercase tracking-wide mb-3">Highlights</h2>
              <ul className="space-y-2">
                {event.event_highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {isOpen ? (
          <RegistrationForm eventId={event.id} eventName={event.event_name} />
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-lg font-bold text-gray-900">Registration Closed</h2>
            <p className="text-gray-500 text-sm mt-2">Registration for this event is currently closed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
