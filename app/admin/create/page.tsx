'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateCode, generateToken } from '@/lib/utils'
import Snowfall from '@/components/Snowfall'
import PinInput from '@/components/PinInput'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    budget: '',
    rules: '',
    admin_pin: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.admin_pin.length !== 4) {
      alert('Bitte gib einen 4-stelligen PIN ein.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Check if PIN already exists
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('admin_pin', formData.admin_pin)
        .single()

      if (existing) {
        alert('Dieser PIN ist bereits vergeben. Bitte wähle einen anderen.')
        setLoading(false)
        return
      }

      const eventCode = generateCode(8)
      const adminSecret = generateToken(32)

      const { data, error } = await supabase
        .from('events')
        .insert({
          name: formData.name,
          date: formData.date,
          budget: formData.budget ? parseInt(formData.budget) : null,
          rules: formData.rules || null,
          event_code: eventCode,
          admin_secret: adminSecret,
          admin_pin: formData.admin_pin,
          is_drawn: false,
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to admin dashboard
      router.push(`/admin/${adminSecret}`)
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Fehler beim Erstellen des Events. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Snowfall />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🎄 Neues Wichtel-Event
            </h1>
            <p className="text-white/90 text-lg">
              Erstelle ein Event für deine Familie oder Freunde
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Familie Weihnachten 2025"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Datum des Wichtelns *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wann findet das Wichteln statt? (z.B. 24.12.2025)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 Budget (optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="z.B. 30"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📜 Regeln & Hinweise (optional)
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="z.B. Selbstgemachtes ist willkommen! Spaß steht im Vordergrund."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  🔐 Dein Admin-PIN (4 Ziffern) *
                </label>
                <PinInput
                  value={formData.admin_pin}
                  onChange={(pin) => setFormData({ ...formData, admin_pin: pin })}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Mit diesem PIN kannst du dich später wieder einloggen
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-christmas-red hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {loading ? 'Erstelle Event...' : 'Event erstellen 🎁'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Nach dem Erstellen bekommst du einen Link, den du mit allen teilen kannst!
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
