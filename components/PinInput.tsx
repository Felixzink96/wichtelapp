'use client'

import { useRef, KeyboardEvent, ClipboardEvent } from 'react'

interface PinInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

export default function PinInput({ value, onChange, length = 4, disabled = false }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/[^0-9]/g, '')

    if (digit.length > 1) {
      // Pasted multiple digits
      const digits = digit.slice(0, length).split('')
      const newValue = [...value.split(''), ...Array(length).fill('')].slice(0, length)
      digits.forEach((d, i) => {
        if (index + i < length) {
          newValue[index + i] = d
        }
      })
      onChange(newValue.join(''))

      // Focus last filled input or next empty
      const nextIndex = Math.min(index + digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    } else if (digit) {
      // Single digit
      const newValue = value.split('')
      newValue[index] = digit
      onChange(newValue.join(''))

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = value.split('')

      if (newValue[index]) {
        // Clear current
        newValue[index] = ''
        onChange(newValue.join(''))
      } else if (index > 0) {
        // Move to previous and clear
        newValue[index - 1] = ''
        onChange(newValue.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length)
    onChange(pastedData.padEnd(length, ''))

    // Focus last input
    const lastIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[lastIndex]?.focus()
  }

  // Create array of digits, fill empty slots with empty string
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: '56px',
            height: '64px',
            textAlign: 'center',
            fontSize: '1.875rem',
            fontWeight: 'bold',
          }}
          className="border-2 border-gray-300 rounded-xl focus:border-christmas-green focus:ring-2 focus:ring-christmas-green/20 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
          autoComplete="off"
        />
      ))}
    </div>
  )
}
