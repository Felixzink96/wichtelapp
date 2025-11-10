'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import Snowfall from '@/components/Snowfall'
import Confetti from '@/components/Confetti'

interface Participant {
  id: string
  name: string
  email: string
  wishlist: string | null
}

interface Event {
  id: string
  name: string
  date: string
  budget: number | null
  rules: string | null
  is_drawn: boolean
}

interface ReceiverInfo {
  name: string
  wishlist: string | null
}

export default function ParticipantPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [receiver, setReceiver] = useState<ReceiverInfo | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [editingWishlist, setEditingWishlist] = useState(false)
  const [wishlistInput, setWishlistInput] = useState('')

  useEffect(() => {
    loadData()

    // Set up realtime subscription for draw events
    const supabase = createClient()
    const channel = supabase
      .channel('event-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draws' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [resolvedParams.token])

  async function loadData() {
    const supabase = createClient()

    // Load participant
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('secret_token', resolvedParams.token)
      .single()

    if (participantError || !participantData) {
      console.error('Participant not found')
      setLoading(false)
      return
    }

    setParticipant(participantData)
    setWishlistInput(participantData.wishlist || '')

    // Load event
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', participantData.event_id)
      .single()

    if (eventData) {
      setEvent(eventData)

      // Load participant count
      const { data: participantsData } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', eventData.id)

      setParticipantCount(participantsData?.length || 0)

      // If drawn, load receiver
      if (eventData.is_drawn) {
        const { data: drawData } = await supabase
          .from('draws')
          .select('receiver_id')
          .eq('giver_id', participantData.id)
          .single()

        if (drawData) {
          const { data: receiverData } = await supabase
            .from('participants')
            .select('name, wishlist')
            .eq('id', drawData.receiver_id)
            .single()

          if (receiverData) {
            setReceiver(receiverData)
            // Show confetti on first load when drawn
            if (!showConfetti) {
              setShowConfetti(true)
              setTimeout(() => setShowConfetti(false), 3000)
            }
          }
        }
      }
    }

    setLoading(false)
  }

  async function updateWishlist() {
    if (!participant) return

    const supabase = createClient()
    const { error } = await supabase
      .from('participants')
      .update({ wishlist: wishlistInput || null })
      .eq('id', participant.id)

    if (error) {
      alert('Fehler beim Speichern der Wunschliste')
    } else {
      setEditingWishlist(false)
      loadData()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </main>
    )
  }

  if (!participant || !event) {
    return (
      <>
        <Snowfall />
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Zugang nicht gefunden</h1>
              <p className="text-gray-600">
                Dieser Link ist ungültig oder wurde gelöscht.
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
      <Confetti show={showConfetti} />
      <main className="min-h-screen p-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              🎅 Hallo {participant.name}!
            </h1>
            <p className="text-white/90 text-lg">{event.name}</p>
          </div>

          {/* Event Info */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Event Details</h2>
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
                  <p className="text-gray-600 whitespace-pre-wrap text-sm">{event.rules}</p>
                </div>
              )}
              <p>
                👥 <strong>Teilnehmer:</strong> {participantCount}
              </p>
            </div>
          </div>

          {/* Draw Result or Waiting */}
          {event.is_drawn && receiver ? (
            <>
              {/* Reveal Box */}
              <div className="bg-gradient-to-br from-christmas-red to-red-700 rounded-2xl shadow-2xl p-8 mb-6 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-2xl font-bold text-white mb-2">Du wichtelst für:</h2>
                <div className="text-5xl font-bold text-white mb-4">
                  {receiver.name}
                </div>
                <p className="text-white/90">
                  Viel Spaß beim Aussuchen des perfekten Geschenks!
                </p>
              </div>

              {/* Receiver Wishlist */}
              {receiver.wishlist && (
                <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6">
                  <h2 className="text-xl font-bold mb-3 text-gray-800">
                    🎁 Wunschliste von {receiver.name}
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{receiver.wishlist}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center mb-6">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Warten auf Wichtel-Ziehung
              </h2>
              <p className="text-gray-600 mb-4">
                Der Admin wird die Ziehung durchführen, sobald alle da sind.
              </p>
              <p className="text-gray-600 text-sm">
                Du wirst benachrichtigt wenn es losgeht! Diese Seite aktualisiert sich automatisch.
              </p>
            </div>
          )}

          {/* My Wishlist */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-800">📝 Deine Wunschliste</h2>
              {!editingWishlist && (
                <button
                  onClick={() => setEditingWishlist(true)}
                  className="text-sm text-christmas-green hover:text-green-800 font-semibold"
                >
                  Bearbeiten
                </button>
              )}
            </div>

            {editingWishlist ? (
              <div className="space-y-3">
                <textarea
                  value={wishlistInput}
                  onChange={(e) => setWishlistInput(e.target.value)}
                  placeholder="z.B.&#10;- Neues Buch&#10;- Warme Socken&#10;- Überrasche mich!"
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-christmas-green focus:ring-0 transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={updateWishlist}
                    className="flex-1 bg-christmas-green hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setEditingWishlist(false)
                      setWishlistInput(participant.wishlist || '')
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : participant.wishlist ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{participant.wishlist}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Noch keine Wunschliste. Hilf deinem Wichtel mit ein paar Ideen!
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
