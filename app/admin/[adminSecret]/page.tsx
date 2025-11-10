'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, performDraw } from '@/lib/utils'
import Snowfall from '@/components/Snowfall'
import Confetti from '@/components/Confetti'

interface Event {
  id: string
  name: string
  date: string
  budget: number | null
  rules: string | null
  is_drawn: boolean
  event_code: string
}

interface Participant {
  id: string
  name: string
  email: string
  wishlist: string | null
}

interface Draw {
  giver_id: string
  receiver_id: string
}

export default function AdminDashboard({ params }: { params: Promise<{ adminSecret: string }> }) {
  const resolvedParams = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const eventLink = event ? `${window.location.origin}/e/${event.event_code}` : ''

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
  }, [resolvedParams.adminSecret])

  async function loadEventData() {
    const supabase = createClient()

    // Load event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('admin_secret', resolvedParams.adminSecret)
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
      .select('*')
      .eq('event_id', eventData.id)
      .order('created_at', { ascending: true })

    setParticipants(participantsData || [])

    // Load draws if already drawn
    if (eventData.is_drawn) {
      const { data: drawsData } = await supabase
        .from('draws')
        .select('*')
        .eq('event_id', eventData.id)

      setDraws(drawsData || [])
    }

    setLoading(false)
  }

  async function startDraw() {
    if (!event || participants.length < 2) {
      alert('Es werden mindestens 2 Teilnehmer benötigt!')
      return
    }

    if (!confirm(`Wichteln jetzt starten? Es sind ${participants.length} Teilnehmer dabei.`)) {
      return
    }

    setDrawing(true)

    try {
      const supabase = createClient()

      // Delete existing draws for this event (in case of re-draw)
      const { error: deleteError } = await supabase
        .from('draws')
        .delete()
        .eq('event_id', event.id)

      if (deleteError) throw deleteError

      // Perform draw
      const participantIds = participants.map((p) => p.id)
      const drawResult = performDraw(participantIds)

      // Save draws to database
      const drawsToInsert = Array.from(drawResult.entries()).map(([giverId, receiverId]) => ({
        event_id: event.id,
        giver_id: giverId,
        receiver_id: receiverId,
      }))

      const { error: drawError } = await supabase.from('draws').insert(drawsToInsert)

      if (drawError) throw drawError

      // Update event as drawn
      const { error: updateError } = await supabase
        .from('events')
        .update({ is_drawn: true })
        .eq('id', event.id)

      if (updateError) throw updateError

      // Show confetti
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      // Reload data
      await loadEventData()

      alert('🎉 Wichteln erfolgreich durchgeführt! Alle Teilnehmer können jetzt sehen, wen sie gezogen haben.')
    } catch (error) {
      console.error('Error during draw:', error)
      alert('Fehler beim Durchführen der Ziehung. Bitte versuche es erneut.')
    } finally {
      setDrawing(false)
    }
  }

  function getReceiverName(giverId: string): string {
    const draw = draws.find((d) => d.giver_id === giverId)
    if (!draw) return '?'
    const receiver = participants.find((p) => p.id === draw.receiver_id)
    return receiver?.name || '?'
  }

  function copyLink() {
    navigator.clipboard.writeText(eventLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyCode() {
    if (event) {
      navigator.clipboard.writeText(event.event_code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Event nicht gefunden</div>
      </main>
    )
  }

  return (
    <>
      <Snowfall />
      <Confetti show={showConfetti} />
      <main className="min-h-screen p-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              🎅 Admin Dashboard
            </h1>
            <p className="text-white/90">{event.name}</p>
          </div>

          {/* Event Info */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Details</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Datum:</strong> {formatDate(event.date)}
              </p>
              {event.budget && (
                <p>
                  <strong>Budget:</strong> bis {event.budget}€
                </p>
              )}
              {event.rules && (
                <p>
                  <strong>Regeln:</strong> {event.rules}
                </p>
              )}
              <p>
                <strong>Status:</strong>{' '}
                <span className={event.is_drawn ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                  {event.is_drawn ? '✅ Wichteln durchgeführt' : '⏳ Warten auf Teilnehmer'}
                </span>
              </p>
            </div>
          </div>

          {/* Event Code & Link */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Event teilen</h2>

            {/* Event Code */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event-Code (für Teilnehmer-Login)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={event?.event_code || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-lg font-bold"
                />
                <button
                  onClick={copyCode}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  {copiedCode ? '✓ Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Teilnehmer brauchen diesen Code für den Login auf der Startseite
              </p>
            </div>

            {/* Event Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event-Link (zur Anmeldung)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={eventLink}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  onClick={copyLink}
                  className="px-6 py-3 bg-christmas-green hover:bg-green-800 text-white font-semibold rounded-xl transition-colors"
                >
                  {copied ? '✓ Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Teile diesen Link mit allen, die sich anmelden sollen
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Teilnehmer ({participants.length})
            </h2>

            {participants.length === 0 ? (
              <p className="text-gray-600">Noch keine Teilnehmer. Teile den Link!</p>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{participant.name}</p>
                      <p className="text-sm text-gray-600">{participant.email}</p>
                      {participant.wishlist && (
                        <p className="text-sm text-gray-500 mt-1">
                          Wunsch: {participant.wishlist.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                    {event.is_drawn && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">beschenkt:</p>
                        <p className="font-semibold text-christmas-green blur-sm select-none" title="Geheim! 🤫">
                          {getReceiverName(participant.id)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Draw Button */}
          {!event.is_drawn && participants.length >= 2 && (
            <button
              onClick={startDraw}
              disabled={drawing}
              className="w-full bg-christmas-red hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {drawing ? 'Wichteln wird durchgeführt...' : '🎲 Wichteln jetzt starten!'}
            </button>
          )}

          {event.is_drawn && (
            <div className="bg-green-500/90 backdrop-blur rounded-2xl shadow-2xl p-6 text-center">
              <p className="text-white font-bold text-xl">
                ✅ Wichteln wurde durchgeführt!
              </p>
              <p className="text-white/90 mt-2">
                Alle Teilnehmer können jetzt sehen, wen sie beschenken.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
