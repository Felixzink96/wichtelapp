'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, generateToken, isValidEmail } from '@/lib/utils'
import Snowfall from '@/components/Snowfall'
import EmojiPicker from '@/components/EmojiPicker'

interface Event {
  id: string
  name: string
  date: string
  budget: number | null
  rules: string | null
  is_drawn: boolean
}

interface Participant {
  id: string
  name: string
  avatar_emoji: string
}

export default function EventJoinPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wishlist: '',
    avatar_emoji: '🎅',
  })

  useEffect(() => {
    loadEventData()

    // Set up realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel('participants-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        loadEventData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [resolvedParams.eventCode])

  async function loadEventData() {
    const supabase = createClient()

    // Load event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('event_code', resolvedParams.eventCode)
      .single()

    if (eventError || !eventData) {
      console.error('Event not found')
      setLoading(false)
      return
    }

    setEvent(eventData)

    // Load participants
    const { data: participantsData } = await supabase
      .from('participants')
      .select('id, name, avatar_emoji')
      .eq('event_id', eventData.id)
      .order('created_at', { ascending: true })

    setParticipants(participantsData || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isValidEmail(formData.email)) {
      alert('Bitte gib eine gültige Email-Adresse ein.')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()

      // Check if email already registered for this event
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', event!.id)
        .eq('email', formData.email)
        .single()

      if (existing) {
        alert('Diese Email-Adresse ist bereits registriert!')
        setSubmitting(false)
        return
      }

      const secretToken = generateToken(32)

      const { data, error } = await supabase
        .from('participants')
        .insert({
          event_id: event!.id,
          name: formData.name,
          email: formData.email,
          wishlist: formData.wishlist || null,
          secret_token: secretToken,
          avatar_emoji: formData.avatar_emoji,
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to participant page
      router.push(`/p/${secretToken}`)
    } catch (error) {
      console.error('Error joining event:', error)
      alert('Fehler beim Anmelden. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </main>
    )
  }

  if (!event) {
    return (
      <>
        <Snowfall />
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Event nicht gefunden</h1>
              <p className="text-gray-600">
                Dieses Wichtel-Event existiert nicht oder wurde gelöscht.
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Snowfall />
      <main className="min-h-screen p-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🎄 {event.name}
            </h1>
            <p className="text-white/90 text-lg">
              Trag dich ein und mach mit beim Wichteln!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Main Column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Event Details</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      📅 <strong>Datum:</strong> {formatDate(event.date)}
                    </p>
                    {event.budget && (
                      <p>
                        💰 <strong>Budget:</strong> bis {event.budget}€
                      </p>
                    )}
                    {event.rules && (
                      <div>
                        <p className="font-semibold mb-1">📜 Regeln:</p>
                        <p className="text-gray-600 whitespace-pre-wrap">{event.rules}</p>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dein Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. Anna"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deine Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="anna@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Speichere deinen Link nach der Anmeldung, um später wieder zuzugreifen
                    </p>
                  </div>

                  <EmojiPicker
                    selected={formData.avatar_emoji}
                    onSelect={(emoji) => setFormData({ ...formData, avatar_emoji: emoji })}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎁 Deine Wunschliste (optional)
                    </label>
                    <textarea
                      value={formData.wishlist}
                      onChange={(e) => setFormData({ ...formData, wishlist: e.target.value })}
                      placeholder="z.B.&#10;- Neues Buch&#10;- Warme Socken&#10;- Überrasche mich!"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dein Wichtel sieht deine Wunschliste und kann sich inspirieren lassen
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-christmas-red hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
                  >
                    {submitting ? 'Wird angemeldet...' : 'Jetzt mitmachen! 🎅'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Participants List */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>👥</span>
                  <span>Teilnehmer ({participants.length})</span>
                </h2>

                {participants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Noch niemand dabei. Sei der Erste! 🎅
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-3xl">{participant.avatar_emoji}</span>
                        <span className="font-semibold text-gray-800">{participant.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {participants.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Die Liste aktualisiert sich automatisch
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
