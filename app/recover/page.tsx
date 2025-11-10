'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Snowfall from '@/components/Snowfall'

export default function RecoverPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createClient()

      // Find participant by email
      const { data: participants, error } = await supabase
        .from('participants')
        .select('secret_token, name')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!participants || participants.length === 0) {
        setMessage('❌ Keine Anmeldung mit dieser Email gefunden.')
        setLoading(false)
        return
      }

      // Show all found links
      const links = participants.map((p) => ({
        name: p.name,
        link: `${window.location.origin}/p/${p.secret_token}`
      }))

      setMessage(`✅ Gefunden! Hier deine Links:\n\n${links.map((l, i) => `${i + 1}. ${l.name}:\n${l.link}`).join('\n\n')}\n\n💡 Speichere sie diesmal!`)
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Fehler bei der Suche.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Snowfall />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🔍 Link vergessen?
            </h1>
            <p className="text-white/90 text-lg">
              Gib deine Email ein und finde deinen Link wieder!
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleRecover} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deine Email-Adresse
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Die Email mit der du dich angemeldet hast
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl whitespace-pre-wrap ${
                  message.includes('✅')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-christmas-red hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {loading ? 'Suche...' : 'Link wiederfinden 🔍'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-christmas-green hover:text-green-800 font-semibold text-sm"
              >
                ← Zurück zur Startseite
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
