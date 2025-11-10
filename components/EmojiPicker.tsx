'use client'

import { useState } from 'react'

interface EmojiPickerProps {
  selected: string
  onSelect: (emoji: string) => void
}

const AVATAR_EMOJIS = [
  // Menschen
  '👨', '👩', '👦', '👧', '🧑', '👶',
  '👴', '👵', '🧔', '👨‍🦰', '👩‍🦰', '👨‍🦱',
  '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲',
  // Weihnachtlich
  '🎅', '🤶', '🧑‍🎄', '🤴', '👸', '🧙',
  '🧝', '🧚', '🧛',
  // Tiere
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
  '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
  '🐴', '🦄', '🐝', '🐛', '🦋', '🐌',
  '🐞', '🐜', '🦗', '🦂', '🐢', '🐍',
  '🦎', '🦖', '🦕', '🐙', '🦑', '🦐',
  '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
  '🐋', '🦈', '🐊', '🐅', '🐆', '🦓',
  '🦍', '🦧', '🐘', '🦛', '🦏', '🐪',
  '🐫', '🦒', '🦘', '🐃', '🐂', '🐄',
]

export default function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Wähle deinen Avatar 😊
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-christmas-green transition-colors bg-white flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{selected}</span>
          <span className="text-gray-600">Klick um zu ändern</span>
        </div>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji)
                  setIsOpen(false)
                }}
                className={`text-3xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  selected === emoji ? 'bg-christmas-green/20 ring-2 ring-christmas-green' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
