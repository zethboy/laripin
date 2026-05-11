# 🏃‍♂️ BURJAW: Multiplayer Web Quiz Game

**BURJAW** adalah permainan kuis multiplayer real-time berbasis web di mana pemain beradu kepintaran dan kecepatan dalam menjawab soal untuk mencapai garis *finish*. Game ini menggabungkan keseruan permainan balapan bergaya *arcade* dengan ketangkasan otak.

![Burjaw Banner](https://i.imgur.com/example-banner.png)

## 🎮 Cara Bermain
1. **Buat atau Gabung Room**: Satu pemain membuat room dan membagikan kode berisi 6 karakter. Pemain lain bisa masuk menggunakan kode tersebut.
2. **Pilih Karakter**: Pilih avatar lucu yang akan mewakili kamu di arena.
3. **Jawab Cepat & Tepat**: Pemain akan diberikan berbagai pernyataan. Pilih apakah pernyataan tersebut **BENAR** atau **SALAH** sebelum waktu habis!
4. **Mencapai Finish**: Setiap jawaban yang benar akan memajukan karaktermu. Pemain dengan skor tertinggi di akhir soal adalah pemenangnya!

---

## ✨ Fitur Utama

### 🔐 1. Autentikasi (Guest & PRO Player)
*   **Guest Mode**: Ingin langsung main tanpa ribet? Masuk sebagai Guest dan dapatkan akses dasar ke dalam game (6 Karakter Dasar, Maksimal 6 Pemain/Room).
*   **PRO Player (Firebase Auth)**: Login menggunakan **Email/Password** atau **Google Account** untuk membuka fitur premium:
    *   Lebih banyak pilihan karakter eksklusif (T-Rex, Gurita, Macan, dll).
    *   Sistem pelacakan statistik yang tersimpan permanen di profil (Total Main, Total Menang, Total Poin, dan Win Rate).
    *   Akses kustomisasi penuh saat membuat *room*.

### ⚔️ 2. Kustomisasi Room (PRO Only)
Host yang sudah login dapat mengatur aturan main saat membuat *room*:
*   **Maksimal Pemain**: Atur dari 4 hingga **30 Pemain** dalam satu *room* sekaligus.
*   **Jumlah Soal**: Atur durasi permainan (10, 20, atau 30 Soal).
*   **Tingkat Kesulitan**: Pilih bank soal dengan tingkat kesulitan *Mudah*, *Sedang*, *Sulit*, atau *Campuran*.

### ⚡ 3. Sinkronisasi Real-Time Super Cepat
*   Menggunakan **Socket.io** untuk memastikan semua pemain berpindah jalur, menjawab, dan melihat papan skor di detik yang persis sama tanpa *delay*.
*   Fitur interaksi *Lobby Chat* secara real-time.
*   Sistem *Kick* langsung oleh Host yang mengeluarkan pemain nakal seketika.

### 🎵 4. BGM & Sound Effects Imersif
*   Musik latar yang berubah secara dinamis (santai di Lobby, menegangkan saat bermain, dan megah saat menang).
*   Suara *tick-tock* saat waktu akan habis.
*   *Sound Effect* kemenangan/kekalahan tiap selesai menjawab.

---

## 🛠️ Tech Stack

**Frontend:**
*   React.js (Vite)
*   Vanilla CSS (Animasi dan Transisi)
*   Socket.io-client
*   Firebase Authentication (Client-side Login)

**Backend:**
*   Node.js & Express.js
*   Socket.io (Game Logic & Real-time Broadcasting)
*   Firebase Admin SDK (Token Verification)
*   Mongoose & MongoDB (Database Statistik Pemain)

---

## 🚀 Cara Instalasi & Menjalankan (Local Development)

### Persyaratan:
*   Node.js (v16+)
*   MongoDB lokal ter-install dan berjalan di `mongodb://localhost:27017` (atau gunakan MongoDB Atlas)
*   Akun Firebase (untuk Firebase Admin dan Client)

### 1. Clone Repositori
```bash
git clone https://github.com/username/laripin.git
cd laripin
```

### 2. Setup Backend (Server)
```bash
cd server
npm install
```
Buat file `.env` di folder `server/` dan isi dengan:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/burjaw

# Firebase Admin Credentials (ambil dari Firebase Console -> Service Accounts)
FIREBASE_PROJECT_ID=proyek-anda-123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@proyek-anda-123.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB... (ISI DENGAN KEY ANDA) ...Q==\n-----END PRIVATE KEY-----\n"
```
Jalankan backend:
```bash
npm start
```

### 3. Setup Frontend (Client)
Buka terminal baru:
```bash
cd client
npm install
```
Buat file `.env` di folder `client/` dan isi dengan:
```env
VITE_SOCKET_URL=http://localhost:5000

# Firebase Client Credentials
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=proyek-anda-123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=proyek-anda-123
VITE_FIREBASE_STORAGE_BUCKET=proyek-anda-123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefg
```
Jalankan frontend:
```bash
npm run dev
```

Buka `http://localhost:5173` di browser Anda dan bersenang-senanglah! 🎉

---
*Dibuat untuk seru-seruan dan belajar teknologi Web Socket & Real-Time Auth!*
