'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  left: number
  color: string
  delay: number
}

export default function Confetti({ show }: { show: boolean }) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!show) return

    const colors = ['#C41E3A', '#165B33', '#FFD700', '#FF6B6B', '#4ECDC4']
    const pieces: ConfettiPiece[] = []

    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      })
    }

    setConfetti(pieces)

    // Clear after animation
    const timeout = setTimeout(() => setConfetti([]), 3000)
    return () => clearTimeout(timeout)
  }, [show])

  if (!show || confetti.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
