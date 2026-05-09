import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2447] via-[#1B3A6B] to-[#0f2447] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#1B3A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-1">ApexCXOs</p>
        <h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed">
          The event link you followed is invalid, has expired, or registration has been closed.
          <br className="hidden sm:block"/>
          Please double-check the URL with the organiser, or visit the ApexCXOs site for upcoming events.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="https://apexcxos-invitations.vercel.app"
            className="inline-flex items-center justify-center bg-[#1B3A6B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors">
            Go to ApexCXOs
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 mt-6">If you believe this is an error, contact your event organiser.</p>
      </div>
    </div>
  )
}
