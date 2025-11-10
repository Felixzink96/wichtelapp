'use client'

import Link from 'next/link'
import Snowfall from '@/components/Snowfall'

export default function Home() {
  return (
    <>
      <Snowfall />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg animate-pulse">
              🎄 Wichtel App 🎅
            </h1>
            <p className="text-2xl text-white/90 mb-4">
              Organisiere dein Familien-Wichteln online!
            </p>
            <p className="text-white/70">
              Einfach, sicher und mit viel Weihnachtszauber ✨
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="space-y-4">
              <Link href="/admin/create" className="block">
                <button className="w-full bg-christmas-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg">
                  Neues Wichtel-Event erstellen 🎁
                </button>
              </Link>

              <Link href="/admin/login" className="block">
                <button className="w-full bg-christmas-green hover:bg-green-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg">
                  Admin Login (mit PIN) 🔐
                </button>
              </Link>

              <Link href="/login" className="block">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg">
                  Teilnehmer Login 🎁
                </button>
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">oder</span>
                </div>
              </div>

              <div className="text-gray-600">
                <p className="mb-2 font-semibold">Hast du einen Event-Link?</p>
                <p className="text-sm">
                  Öffne einfach den Link den du bekommen hast und trag dich ein! 🎅
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-xs text-gray-600 font-semibold">Einfach</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-xs text-gray-600 font-semibold">Sicher</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-xs text-gray-600 font-semibold">Magisch</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                Kein Passwort nötig! Links teilen und los geht&apos;s.
              </p>
            </div>
          </div>

          <div className="mt-8 text-white/70 text-sm space-y-2">
            <p>Gemacht mit ❤️ für die Familie</p>
            <p className="text-xs">
              Wichteln war noch nie so einfach! 🎄
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
