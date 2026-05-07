# LARIPIN 🏃

Real-time multiplayer quiz game — pilih karakter, validasi pernyataan, lari ke jalur yang benar!

## Setup & Run

### Backend
```bash
cd server
npm install
node index.js
# Server berjalan di http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev
# App berjalan di http://localhost:5173
```

## Cara Main
1. Buka http://localhost:5173 di **2 tab browser berbeda**
2. Masukkan username berbeda di tiap tab
3. Pilih karakter
4. Tab 1: klik **BUAT ROOM** → catat kode room
5. Tab 2: klik **JOIN ROOM** → masukkan kode room
6. Tab 1 (host): klik **MULAI GAME**
7. Jawab soal dengan klik **BENAR** atau **SALAH**
8. Lihat karakter semua pemain bergerak secara realtime!

## Deploy

### Backend → Railway
1. Push folder `server` ke GitHub
2. Connect ke Railway, set start command: `node index.js`
3. Add environment variable: `CLIENT_URL=https://your-vercel-app.vercel.app`

### Frontend → Vercel
1. Push folder `client` ke GitHub
2. Connect ke Vercel
3. Add environment variable: `VITE_SOCKET_URL=https://your-railway-app.railway.app`

## Tech Stack
- Frontend: React.js + Vite + CSS Animations
- Backend: Node.js + Express + Socket.IO
- Realtime: WebSocket via Socket.IO
- Font: Press Start 2P (retro) + Rajdhani (UI)
- Theme: Dark esports

## Fitur Realtime (Socket.IO)
- Player join/leave → semua pemain update otomatis
- Timer countdown → sync untuk semua pemain
- Karakter pindah jalur → terlihat oleh semua pemain secara live
- Skor update → setelah tiap soal selesai
- Leaderboard → muncul bersamaan di semua layar
