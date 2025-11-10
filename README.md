# 🎄 Wichtel App

Eine wunderschöne Web-App zum Organisieren von Familien-Wichteln online!

## ✨ Features

- 🎅 **Einfaches Event-Erstellen** - Admin erstellt Event mit Namen, Datum, Budget und Regeln
- 🎁 **Event-Link Teilen** - Ein Link für alle Teilnehmer zum Mitmachen
- 📝 **Wunschlisten** - Jeder kann direkt beim Anmelden seine Wünsche angeben
- 🎲 **Automatische Ziehung** - Algorithmus stellt sicher, dass niemand sich selbst zieht
- 🔴 **Realtime Updates** - Live-Counter für Teilnehmer
- 🎊 **Weihnachtliches Design** - Mit Schneefall, Konfetti und festlichen Farben
- 🔒 **Sicher** - Jeder hat einen eigenen geheimen Token, keine Passwörter nötig
- 📱 **Mobile-First** - Perfekt auf dem Handy nutzbar

## 🚀 Tech Stack

- **Next.js 16** - React Framework mit App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Database (Postgres) + Realtime
- **Vercel** - Hosting & Deployment

## 📦 Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build
npm start
```

## 🔧 Setup

1. **Supabase Projekt erstellen**
   - Gehe zu [supabase.com](https://supabase.com) und erstelle ein Projekt
   - Kopiere die Project URL und API Keys

2. **Datenbank einrichten**
   - Öffne den SQL Editor in Supabase
   - Führe das SQL aus `supabase-schema.sql` aus

3. **Environment Variables**
   - Kopiere `.env.local.example` zu `.env.local`
   - Füge deine Supabase Credentials ein:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **App starten**
   ```bash
   npm run dev
   ```
   - Öffne [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment auf Vercel

1. **Repository zu GitHub pushen**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo
   git push -u origin main
   ```

2. **Vercel Projekt erstellen**
   - Gehe zu [vercel.com](https://vercel.com)
   - Klicke "New Project"
   - Importiere dein GitHub Repository
   - Vercel erkennt automatisch Next.js

3. **Environment Variables in Vercel**
   - Gehe zu Project Settings → Environment Variables
   - Füge hinzu:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy!**
   - Vercel deployed automatisch bei jedem Push
   - Deine App ist live unter `your-project.vercel.app`

## 📱 Wie es funktioniert

### Für Admins (Organizer)

1. Gehe auf die Homepage
2. Klicke "Neues Wichtel-Event erstellen"
3. Fülle Event-Details aus:
   - Name (z.B. "Familie Weihnachten 2025")
   - Datum
   - Budget (optional)
   - Regeln (optional)
4. Klicke "Event erstellen"
5. Teile den Event-Link mit allen Teilnehmern
6. Warte bis sich alle eingetragen haben
7. Klicke "Wichteln jetzt starten!"
8. Fertig! Alle bekommen ihre Ziehung angezeigt

### Für Teilnehmer

1. Öffne den Event-Link
2. Trag dich ein mit:
   - Name
   - Email
   - Wunschliste (optional)
3. Klicke "Jetzt mitmachen"
4. Warte auf die Ziehung
5. Sobald der Admin die Ziehung startet, siehst du automatisch wen du beschenkst!
6. Du kannst die Wunschliste deines Beschenkten sehen

## 🎨 Design Features

- ❄️ Animierter Schneefall im Hintergrund
- 🎊 Konfetti-Animation bei der Ziehung
- 🎄 Weihnachtliche Farbpalette (Rot, Grün, Gold)
- ✨ Smooth Transitions und Hover-Effekte
- 📱 Responsive Design für alle Geräte

## 🔐 Sicherheit

- **Row Level Security** in Supabase aktiviert
- **Geheime Tokens** für jeden Teilnehmer und Admin
- **Keine Passwörter** - Token-basierter Zugang
- **Anon Key** ist sicher für Frontend (RLS schützt die Daten)

## 📄 Lizenz

MIT - Gemacht mit ❤️ für die Familie

## 🎅 Viel Spaß beim Wichteln!
