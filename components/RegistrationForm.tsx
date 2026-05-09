'use client'
import { useState } from 'react'

interface Props { eventId: string; eventName: string }
interface FormData {
  name: string; title: string; organization: string; email: string;
  contact_number: string; linkedin_id: string; consent_given: boolean;
}
type SubmitState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'
type Errors = Partial<Record<keyof FormData, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE   = /^https?:\/\/.+/i

export default function RegistrationForm({ eventId, eventName }: Props) {
  const [form, setForm] = useState<FormData>({ name: '', title: '', organization: '', email: '', contact_number: '', linkedin_id: '', consent_given: false })
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = field === 'consent_given' ? e.target.checked : e.target.value
      setForm(f => ({ ...f, [field]: val }))
      // clear that field's error as soon as user starts typing
      setErrors(prev => prev[field] ? { ...prev, [field]: undefined } : prev)
    }
  }

  function validate(f: FormData): Errors {
    const e: Errors = {}
    if (!f.name.trim()) e.name = 'Full name is required.'
    else if (f.name.trim().length < 2) e.name = 'Please enter your full name.'

    if (!f.email.trim()) e.email = 'Email address is required.'
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter a valid email address (e.g. you@company.com).'

    if (f.contact_number && f.contact_number.replace(/\D/g, '').length < 7)
      e.contact_number = 'Contact number looks too short.'

    if (f.linkedin_id && !URL_RE.test(f.linkedin_id.trim()))
      e.linkedin_id = 'LinkedIn URL must start with http:// or https://'

    if (!f.consent_given) e.consent_given = 'Please accept the consent statement to register.'

    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length > 0) {
      // focus the first invalid field
      const first = Object.keys(v)[0]
      const el = document.querySelector<HTMLInputElement>(`[name="${first}"]`)
      el?.focus()
      return
    }
    setState('submitting'); setErrorMsg('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, ...form }),
      })
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
      <h2 className="text-xl font-bold text-gray-900">You&apos;re registered!</h2>
      <p className="text-gray-500 text-sm mt-2">Thank you, <strong>{form.name}</strong>. Your registration for <strong>{eventName}</strong> has been confirmed.</p>
    </div>
  )

  if (state === 'duplicate') return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900">Already Registered</h2>
      <p className="text-gray-500 text-sm mt-2"><strong>{form.email}</strong> is already registered for this event.</p>
    </div>
  )

  // common input class builder — switches to red ring + border when there's an error
  const cls = (field: keyof FormData) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-red-400 ring-1 ring-red-200 focus:ring-red-300 bg-red-50/40'
        : 'border-gray-300 focus:ring-[#1B3A6B]'
    }`

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Register Your Attendance</h2>
      <p className="text-gray-500 text-sm mb-6">Fill in your details to confirm your spot at <strong>{eventName}</strong>.</p>

      {errorCount > 0 && (
        <div role="alert" className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <p className="font-semibold">Please fix {errorCount === 1 ? 'this error' : `these ${errorCount} errors`} before submitting:</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input id="name" name="name" type="text" value={form.name} onChange={update('name')}
              aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined}
              placeholder="Your full name" className={cls('name')} />
            {errors.name && <p id="err-name" className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title / Designation</label>
            <input id="title" name="title" type="text" value={form.title} onChange={update('title')}
              placeholder="e.g. Chief Executive Officer" className={cls('title')} />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input id="organization" name="organization" type="text" value={form.organization} onChange={update('organization')}
              placeholder="Your company" className={cls('organization')} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input id="email" name="email" type="email" value={form.email} onChange={update('email')}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined}
              placeholder="you@example.com" className={cls('email')} />
            {errors.email && <p id="err-email" className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input id="contact_number" name="contact_number" type="tel" value={form.contact_number} onChange={update('contact_number')}
              aria-invalid={!!errors.contact_number} aria-describedby={errors.contact_number ? 'err-contact' : undefined}
              placeholder="+91 98765 43210" className={cls('contact_number')} />
            {errors.contact_number && <p id="err-contact" className="mt-1.5 text-xs text-red-600 font-medium">{errors.contact_number}</p>}
          </div>

          <div>
            <label htmlFor="linkedin_id" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
            <input id="linkedin_id" name="linkedin_id" type="url" value={form.linkedin_id} onChange={update('linkedin_id')}
              aria-invalid={!!errors.linkedin_id} aria-describedby={errors.linkedin_id ? 'err-linkedin' : undefined}
              placeholder="https://linkedin.com/in/yourname" className={cls('linkedin_id')} />
            {errors.linkedin_id && <p id="err-linkedin" className="mt-1.5 text-xs text-red-600 font-medium">{errors.linkedin_id}</p>}
          </div>
        </div>

        <div className="pt-2">
          <div className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${errors.consent_given ? 'bg-red-50 border border-red-200' : ''}`}>
            <input id="consent" name="consent_given" type="checkbox" checked={form.consent_given} onChange={update('consent_given')}
              aria-invalid={!!errors.consent_given}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B]" />
            <label htmlFor="consent" className="text-sm text-gray-600">I consent to ApexCXOs collecting and using my information for event communication and networking purposes.</label>
          </div>
          {errors.consent_given && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.consent_given}</p>}
        </div>

        {state === 'error' && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{errorMsg}</div>}

        <button type="submit" disabled={state === 'submitting'}
          className="w-full bg-[#1B3A6B] text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 mt-2">
          {state === 'submitting' ? 'Submitting…' : 'Confirm Registration'}
        </button>
      </form>
    </div>
  )
}
