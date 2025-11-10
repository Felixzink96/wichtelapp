'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Snowfall from '@/components/Snowfall'
import PinInput from '@/components/PinInput'

export default function AdminLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length !== 4) {
      setError('Bitte gib einen 4-stelligen PIN ein.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data, error: dbError } = await supabase
        .from('events')
        .select('admin_secret')
        .eq('admin_pin', pin)
        .single()

      if (dbError || !data) {
        setError('PIN nicht gefunden. Bitte überprüfe deine Eingabe.')
        setLoading(false)
        return
      }

      // Redirect to admin dashboard
      router.push(`/admin/${data.admin_secret}`)
    } catch (error) {
      console.error('Error logging in:', error)
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
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
              🎅 Admin Login
            </h1>
            <p className="text-white/90 text-lg">
              Gib deinen 4-stelligen PIN ein
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  🔐 Admin PIN
                </label>
                <PinInput
                  value={pin}
                  onChange={setPin}
                  disabled={loading}
                />
                {error && (
                  <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="w-full bg-christmas-red hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {loading ? 'Lädt...' : 'Einloggen'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Noch kein Event erstellt?
              </p>
              <button
                onClick={() => router.push('/admin/create')}
                className="text-christmas-green hover:text-green-800 font-semibold text-sm"
              >
                Neues Event erstellen →
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
