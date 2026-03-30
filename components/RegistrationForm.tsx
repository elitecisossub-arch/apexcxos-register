'use client'
import { useState } from 'react'

interface Props { eventId: string; eventName: string }
interface FormData {
  name: string; title: string; organization: string; email: string;
  contact_number: string; linkedin_id: string; consent_given: boolean;
}
type SubmitState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'

export default function RegistrationForm({ eventId, eventName }: Props) {
  const [form, setForm] = useState<FormData>({ name: '', title: '', organization: '', email: '', contact_number: '', linkedin_id: '', consent_given: false })
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = field === 'consent_given' ? e.target.checked : e.target.value
      setForm(f => ({ ...f, [field]: val }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('submitting'); setErrorMsg('')
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: eventId, ...form }) })
      const json = await res.json()
      if (res.status === 409 || json.duplicate) setState('duplicate')
      else if (res.ok) setState('success')
      else { setState('error'); setErrorMsg(json.error || 'Something went wrong.') }
    } catch { setState('error'); setErrorMsg('Network error. Please try again.') }
  }

  if (state === 'success') return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">You're registered!</h2>
      <p className="text-gray-500 text-sm mt-2">Thank you, <strong>{form.name}</strong>. Your registration for <strong>{eventName}</strong> has been confirmed.</p>
    </div>
  )

  if (state === 'duplicate') return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900">Already Registered</h2>
      <p className="text-gray-500 text-sm mt-2"><strong>{form.email}</strong> is already registered for this event.</p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Register Your Attendance</h2>
      <p className="text-gray-500 text-sm mb-6">Fill in your details to confirm your spot at <strong>{eventName}</strong>.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" required value={form.name} onChange={update('name')} placeholder="Your full name" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title / Designation</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="e.g. Chief Executive Officer" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input type="text" value={form.organization} onChange={update('organization')} placeholder="Your company" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input type="tel" value={form.contact_number} onChange={update('contact_number')} placeholder="+91 98765 43210" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
            <input type="url" value={form.linkedin_id} onChange={update('linkedin_id')} placeholder="https://linkedin.com/in/yourname" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
          </div>
        </div>
        <div className="flex items-start gap-3 pt-2">
          <input type="checkbox" id="consent" required checked={form.consent_given} onChange={update('consent_given')} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B]" />
          <label htmlFor="consent" className="text-sm text-gray-600">I consent to ApexCXOs collecting and using my information for event communication and networking purposes.</label>
        </div>
        {state === 'error' && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{errorMsg}</div>}
        <button type="submit" disabled={state === 'submitting' || !form.consent_given} className="w-full bg-[#1B3A6B] text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 mt-2">
          {state === 'submitting' ? 'Submitting…' : 'Confirm Registration'}
        </button>
      </form>
    </div>
  )
}
