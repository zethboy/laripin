# PROJECT CONTEXT: LARIPIN

## IDENTITAS PROJECT
**Nama Project:** Laripin  
**Jenis Project:** Multiplayer Web Quiz Game (Real-time)  
**Tujuan Project:** Menyediakan platform kuis interaktif di mana pemain berkompetisi secara real-time dengan representasi visual avatar yang bergerak di jalur jawaban (Benar/Salah).

---

## TECH STACK
### Frontend
- **Framework:** React.js (Vite)
- **State Management:** React Hooks (useState, useEffect, useCallback, useRef)
- **Communication:** Socket.io-client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Communication:** Socket.io (WebSockets)
- **Game Logic:** Custom Room-based handler

### Database
- **Current:** In-memory (Local Object Storage)
- **Planned:** MongoDB (untuk Leaderboard & Auth)

### Styling & Audio
- **CSS:** Vanilla CSS (Modern, Dark Mode, Glassmorphism)
- **Audio:** Web Audio API (Pure JS Sound Synthesis - no external assets)

---

## FITUR UTAMA
1.  **Sistem Room & Lobby:**
    - Pembuatan Room dengan kode unik 6 digit.
    - Bergabung ke Room yang sudah ada via kode.
    - Batas maksimal 6 pemain per room dengan *Ghost Slot placeholders*.
2.  **Kustomisasi Pemain:**
    - Input Username.
    - Pemilihan Avatar Emoji (Pingo, Frogo, Robo, dll).
3.  **Real-time Lobby Chat:**
    - Chat room interaktif saat menunggu di Lobby.
    - Notifikasi sistem dan pesan dari pemain lain dengan timestamp.
4.  **Mekanisme Game (Arena):**
    - **Dynamic Movement:** Pemain bisa berpindah jalur (Benar/Salah) secara visual.
    - **Dual Lane Layout:** Jalur "Benar" (Hijau) dan "Salah" (Merah).
    - **Live Timer:** Sinkronisasi waktu 10 detik per soal dengan bar progres visual.
    - **Re-answering:** Fleksibilitas mengubah jawaban hingga waktu habis.
5.  **Audio & Visual Experience:**
    - **SFX Synthesis:** Suara *Correct*, *Wrong*, *Tick*, dan *Countdown* yang disintesis secara langsung.
    - **Animations:** State *Idle*, *Running*, *Celebrate*, dan *Fall* untuk setiap avatar.
    - **Countdown Overlay:** Animasi "3... 2... 1... GO!" sebelum kuis dimulai.
6.  **Hasil & Leaderboard:**
    - Banner jawaban benar/salah setelah setiap soal.
    - Klasemen akhir (Leaderboard) berdasarkan poin yang terkumpul.

---

## STRUKTUR PROJECT
- `client/src/`
  - `pages/`: Login, Home, Lobby, Game, Result.
  - `components/`: Komponen UI reusable (ConnectionStatus, dll).
  - `styles/`: Modul CSS per halaman.
  - `constants/`: Data statis (daftar avatar, tipe soal).
  - `socket.js`: Konfigurasi socket client.
- `server/`
  - `index.js`: Entry point server.
  - `gameHandler.js`: Seluruh logika game, room, dan chat.
  - `questions.js`: Kumpulan bank soal kuis.

---

## STYLE CODING & ATURAN
- **Clean Code:** Gunakan penamaan variabel yang semantik dan deskriptif.
- **Modular:** Pisahkan logika socket, UI, dan styling.
- **Responsive:** UI harus mendukung tampilan Desktop dan Mobile (Vertical Lanes).
- **No Hardcode:** Gunakan konstanta atau data dari server untuk konten dinamis.
- **Socket Safety:** Selalu bersihkan (*cleanup*) listener socket di `useEffect` untuk mencegah memory leak.

---
© 2026 Laripin - Professional Multiplayer Quiz Platform.
