'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Snowfall from '@/components/Snowfall'
import PinInput from '@/components/PinInput'

export default function ParticipantLoginPage() {
  const router = useRouter()
  const [eventCode, setEventCode] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Find event by code (case-insensitive)
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .ilike('event_code', eventCode)
        .single()

      if (eventError || !event) {
        setError('❌ Event-Code nicht gefunden.')
        setLoading(false)
        return
      }

      // Find participant by event + email + PIN
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('secret_token, name, personal_pin')
        .eq('event_id', event.id)
        .eq('email', email)
        .single()

      if (participantError || !participant) {
        setError('❌ Keine Anmeldung mit dieser Email für dieses Event gefunden.')
        setLoading(false)
        return
      }

      // Verify PIN
      if (participant.personal_pin !== pin) {
        setError('❌ Falscher PIN! Bitte versuche es erneut.')
        setLoading(false)
        return
      }

      // Redirect to participant page
      router.push(`/p/${participant.secret_token}`)
    } catch (error) {
      console.error('Error:', error)
      setError('❌ Fehler beim Login. Bitte versuche es erneut.')
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
              🎁 Teilnehmer Login
            </h1>
            <p className="text-white/90 text-lg">
              Melde dich mit Event-Code, Email und PIN an!
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event-Code
                </label>
                <input
                  type="text"
                  required
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder="z.B. xmas2024"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Den Event-Code hast du vom Admin bekommen
                </p>
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dein PIN
                </label>
                <PinInput
                  value={pin}
                  onChange={setPin}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Der 4-stellige PIN den du bei der Anmeldung gewählt hast
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-100 text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-christmas-red hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {loading ? 'Einloggen...' : 'Einloggen 🎅'}
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
