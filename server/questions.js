const questions = [
  // Sejarah
  { id: 1, statement: "Soekarno adalah presiden pertama Indonesia", is_correct: true, category: "Sejarah", difficulty: "Mudah" },
  { id: 5, statement: "Indonesia merdeka pada tanggal 17 Agustus 1945", is_correct: true, category: "Sejarah", difficulty: "Mudah" },
  { id: 11, statement: "Candi Borobudur terletak di Jawa Tengah", is_correct: true, category: "Sejarah", difficulty: "Mudah" },
  { id: 18, statement: "Albert Einstein adalah penemu bola lampu", is_correct: false, category: "Sejarah", difficulty: "Sedang" },
  { id: 26, statement: "Perang Dunia II berakhir pada tahun 1945", is_correct: true, category: "Sejarah", difficulty: "Sedang" },
  { id: 27, statement: "Kerajaan Majapahit didirikan oleh Hayam Wuruk", is_correct: false, category: "Sejarah", difficulty: "Sulit" },
  { id: 28, statement: "Cut Nyak Dien adalah pahlawan nasional dari Aceh", is_correct: true, category: "Sejarah", difficulty: "Sedang" },
  { id: 29, statement: "Titanic tenggelam pada pelayaran pertamanya", is_correct: true, category: "Sejarah", difficulty: "Mudah" },
  { id: 30, statement: "Tembok Besar Cina dibangun hanya dalam waktu 10 tahun", is_correct: false, category: "Sejarah", difficulty: "Sulit" },
  { id: 31, statement: "Ibu kota Indonesia sebelum Jakarta adalah Yogyakarta", is_correct: true, category: "Sejarah", difficulty: "Sedang" },
  { id: 32, statement: "Julius Caesar adalah kaisar Romawi pertama", is_correct: false, category: "Sejarah", difficulty: "Sulit" },
  { id: 33, statement: "Penemu benua Amerika adalah Christopher Columbus", is_correct: true, category: "Sejarah", difficulty: "Sedang" },
  { id: 34, statement: "Gajah Mada mengucapkan Sumpah Palapa", is_correct: true, category: "Sejarah", difficulty: "Sedang" },
  { id: 35, statement: "Manusia pertama yang mendarat di bulan adalah Yuri Gagarin", is_correct: false, category: "Sejarah", difficulty: "Sedang" },

  // Sains
  { id: 2, statement: "Air mendidih pada suhu 90 derajat celcius", is_correct: false, category: "Sains", difficulty: "Mudah" },
  { id: 4, statement: "Matahari adalah bintang terbesar di alam semesta", is_correct: false, category: "Sains", difficulty: "Sedang" },
  { id: 9, statement: "Bumi mengelilingi matahari dalam 365 hari", is_correct: true, category: "Sains", difficulty: "Mudah" },
  { id: 13, statement: "Kilat lebih cepat terlihat daripada petir terdengar", is_correct: true, category: "Sains", difficulty: "Mudah" },
  { id: 15, statement: "Planet terbesar di tata surya adalah Saturnus", is_correct: false, category: "Sains", difficulty: "Mudah" },
  { id: 16, statement: "Venus adalah planet terpanas di tata surya kita", is_correct: true, category: "Sains", difficulty: "Sulit" },
  { id: 17, statement: "Emas adalah logam yang paling keras di bumi", is_correct: false, category: "Sains", difficulty: "Sedang" },
  { id: 21, statement: "DNA manusia 50% mirip dengan pisang", is_correct: true, category: "Sains", difficulty: "Sulit" },
  { id: 36, statement: "Bunyi bisa merambat di ruang hampa", is_correct: false, category: "Sains", difficulty: "Sedang" },
  { id: 37, statement: "Besi berkarat karena reaksi dengan oksigen", is_correct: true, category: "Sains", difficulty: "Sedang" },
  { id: 38, statement: "Pluto saat ini diklasifikasikan sebagai planet kerdil", is_correct: true, category: "Sains", difficulty: "Sedang" },
  { id: 39, statement: "Kecepatan cahaya lebih lambat dari kecepatan suara", is_correct: false, category: "Sains", difficulty: "Mudah" },
  { id: 40, statement: "Berlian terbentuk dari karbon", is_correct: true, category: "Sains", difficulty: "Sedang" },
  { id: 41, statement: "Atom terdiri dari proton, neutron, dan elektron", is_correct: true, category: "Sains", difficulty: "Mudah" },
  { id: 42, statement: "Warna langit biru karena pantulan air laut", is_correct: false, category: "Sains", difficulty: "Sulit" },
  { id: 43, statement: "Air bisa berada dalam wujud padat, cair, dan gas", is_correct: true, category: "Sains", difficulty: "Mudah" },
  { id: 44, statement: "Awan terbuat dari uap air", is_correct: false, category: "Sains", difficulty: "Sedang" },
  
  // New Sains
  { id: 101, statement: "Elektron bermuatan positif", is_correct: false, category: "Sains", difficulty: "Sedang" },
  { id: 102, statement: "H2O adalah rumus kimia untuk air", is_correct: true, category: "Sains", difficulty: "Mudah" },
  { id: 103, statement: "Pusat tata surya kita adalah Bumi", is_correct: false, category: "Sains", difficulty: "Mudah" },

  // Biologi & Alam
  { id: 6, statement: "Jantung manusia memiliki 3 ruang", is_correct: false, category: "Biologi", difficulty: "Sedang" },
  { id: 10, statement: "Paus adalah jenis ikan terbesar", is_correct: false, category: "Biologi", difficulty: "Mudah" },
  { id: 19, statement: "Burung unta tidak bisa terbang", is_correct: true, category: "Biologi", difficulty: "Mudah" },
  { id: 24, statement: "Bambu adalah jenis rumput", is_correct: true, category: "Biologi", difficulty: "Sedang" },
  { id: 25, statement: "Gurita memiliki tiga jantung", is_correct: true, category: "Biologi", difficulty: "Sulit" },
  { id: 45, statement: "Tomat secara botani diklasifikasikan sebagai sayuran", is_correct: false, category: "Biologi", difficulty: "Sedang" },
  { id: 46, statement: "Manusia memiliki 206 tulang di tubuh dewasanya", is_correct: true, category: "Biologi", difficulty: "Sulit" },
  { id: 47, statement: "Pinguin hidup di kutub utara", is_correct: false, category: "Biologi", difficulty: "Sedang" },
  { id: 48, statement: "Kelelawar adalah satu-satunya mamalia yang bisa terbang", is_correct: true, category: "Biologi", difficulty: "Sedang" },
  { id: 49, statement: "Katak memulai hidupnya dengan insang", is_correct: true, category: "Biologi", difficulty: "Mudah" },
  { id: 50, statement: "Bintang laut tidak memiliki otak", is_correct: true, category: "Biologi", difficulty: "Sulit" },
  { id: 51, statement: "Gigi manusia sama kuatnya dengan gigi hiu", is_correct: false, category: "Biologi", difficulty: "Sulit" },
  { id: 52, statement: "Anjing hanya bisa melihat warna hitam dan putih", is_correct: false, category: "Biologi", difficulty: "Sedang" },
  { id: 53, statement: "Pisang tumbuh di pohon", is_correct: false, category: "Biologi", difficulty: "Sulit" },
  { id: 54, statement: "Kulit adalah organ terbesar di tubuh manusia", is_correct: true, category: "Biologi", difficulty: "Sedang" },

  // Geografi
  { id: 3, statement: "Gunung Everest adalah gunung tertinggi di dunia", is_correct: true, category: "Geografi", difficulty: "Mudah" },
  { id: 7, statement: "Bahasa resmi Brazil adalah Spanyol", is_correct: false, category: "Geografi", difficulty: "Sedang" },
  { id: 20, statement: "Gurun Sahara adalah gurun terbesar di dunia", is_correct: false, category: "Geografi", difficulty: "Sulit" },
  { id: 22, statement: "Rusia adalah negara dengan wilayah terluas di dunia", is_correct: true, category: "Geografi", difficulty: "Sedang" },
  { id: 55, statement: "Sungai Nil adalah sungai terpanjang di dunia", is_correct: true, category: "Geografi", difficulty: "Sedang" },
  { id: 56, statement: "Australia adalah sebuah benua dan juga negara", is_correct: true, category: "Geografi", difficulty: "Mudah" },
  { id: 57, statement: "Ibu kota Australia adalah Sydney", is_correct: false, category: "Geografi", difficulty: "Sedang" },
  { id: 58, statement: "Benua terkecil di dunia adalah Eropa", is_correct: false, category: "Geografi", difficulty: "Sedang" },
  { id: 59, statement: "Indonesia memiliki lebih dari 17.000 pulau", is_correct: true, category: "Geografi", difficulty: "Mudah" },
  { id: 60, statement: "Gunung Kilimanjaro terletak di Afrika", is_correct: true, category: "Geografi", difficulty: "Sedang" },
  { id: 61, statement: "Mata uang Jepang adalah Won", is_correct: false, category: "Geografi", difficulty: "Mudah" },
  { id: 62, statement: "Negara yang dijuluki Negeri Matahari Terbit adalah Jepang", is_correct: true, category: "Geografi", difficulty: "Mudah" },
  { id: 63, statement: "Patung Liberty merupakan hadiah dari Inggris", is_correct: false, category: "Geografi", difficulty: "Sedang" },
  { id: 64, statement: "Vatikan adalah negara terkecil di dunia", is_correct: true, category: "Geografi", difficulty: "Mudah" },

  // Olahraga & Hiburan
  { id: 65, statement: "Sepak bola dimainkan oleh 11 pemain di setiap tim", is_correct: true, category: "Olahraga", difficulty: "Mudah" },
  { id: 66, statement: "Olimpiade diadakan setiap 5 tahun sekali", is_correct: false, category: "Olahraga", difficulty: "Mudah" },
  { id: 67, statement: "Catur adalah olahraga yang diakui oleh komite Olimpiade", is_correct: true, category: "Olahraga", difficulty: "Sulit" },
  { id: 68, statement: "Karakter Mario pertama kali muncul di game Donkey Kong", is_correct: true, category: "Hiburan", difficulty: "Sulit" },
  { id: 69, statement: "Mickey Mouse diciptakan oleh Walt Disney", is_correct: true, category: "Hiburan", difficulty: "Mudah" },
  { id: 70, statement: "Film dengan pendapatan tertinggi sepanjang masa adalah Avatar", is_correct: true, category: "Hiburan", difficulty: "Sedang" },
  { id: 71, statement: "Hogwarts adalah nama sekolah dalam seri Harry Potter", is_correct: true, category: "Hiburan", difficulty: "Mudah" },
  { id: 72, statement: "Pikachu adalah maskot utama dari serial Digimon", is_correct: false, category: "Hiburan", difficulty: "Mudah" },
  { id: 73, statement: "Dalam game Monopoli, ada kotak bernama 'Penjara'", is_correct: true, category: "Hiburan", difficulty: "Mudah" },
  { id: 74, statement: "Bola basket diciptakan di Kanada", is_correct: false, category: "Olahraga", difficulty: "Sulit" },

  // Mitos & Fakta Unik
  { id: 8, statement: "Kupu-kupu merasakan makanan lewat kakinya", is_correct: true, category: "Fakta Unik", difficulty: "Sulit" },
  { id: 12, statement: "Manusia hanya menggunakan 10% dari otaknya", is_correct: false, category: "Mitos", difficulty: "Sedang" },
  { id: 14, statement: "Semut bisa mengangkat 50 kali berat tubuhnya", is_correct: true, category: "Fakta Unik", difficulty: "Sedang" },
  { id: 23, statement: "Kelelawar adalah hewan buta", is_correct: false, category: "Mitos", difficulty: "Sedang" },
  { id: 75, statement: "Madu tidak akan pernah basi", is_correct: true, category: "Fakta Unik", difficulty: "Sedang" },
  { id: 76, statement: "Banteng membenci warna merah", is_correct: false, category: "Mitos", difficulty: "Sedang" },
  { id: 77, statement: "Memecahkan buku jari (kretek) menyebabkan radang sendi", is_correct: false, category: "Mitos", difficulty: "Sedang" },
  { id: 78, statement: "Petir tidak pernah menyambar tempat yang sama dua kali", is_correct: false, category: "Mitos", difficulty: "Mudah" },
  { id: 79, statement: "Sidik jari setiap orang berbeda, bahkan kembar identik", is_correct: true, category: "Fakta Unik", difficulty: "Mudah" },
  { id: 80, statement: "Eiffel Tower dapat menyusut saat musim dingin", is_correct: true, category: "Fakta Unik", difficulty: "Sulit" },
  { id: 81, statement: "Koin yang dijatuhkan dari gedung tinggi bisa membunuh orang", is_correct: false, category: "Mitos", difficulty: "Sulit" },
  { id: 82, statement: "Nyamuk lebih menyukai golongan darah O", is_correct: true, category: "Fakta Unik", difficulty: "Sedang" },
  { id: 83, statement: "Gajah adalah satu-satunya hewan yang tidak bisa melompat", is_correct: true, category: "Fakta Unik", difficulty: "Sedang" },
  { id: 84, statement: "Rambut dan kuku terus tumbuh setelah kematian", is_correct: false, category: "Mitos", difficulty: "Sedang" },
  
  // Pengetahuan Umum Lainnya
  { id: 85, statement: "Angka romawi V bernilai 5", is_correct: true, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 86, statement: "Terdapat 7 hari dalam satu minggu", is_correct: true, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 87, statement: "Satu menit terdiri dari 60 detik", is_correct: true, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 88, statement: "Satu jam terdiri dari 3600 menit", is_correct: false, category: "Pengetahuan Umum", difficulty: "Sedang" },
  { id: 89, statement: "Uang kertas di Indonesia dicetak oleh Peruri", is_correct: true, category: "Pengetahuan Umum", difficulty: "Sulit" },
  { id: 90, statement: "Lambang negara Indonesia adalah Garuda Pancasila", is_correct: true, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 91, statement: "Hari Kemerdekaan Amerika Serikat adalah 4 Juli", is_correct: true, category: "Pengetahuan Umum", difficulty: "Sedang" },
  { id: 92, statement: "Bendera Inggris hanya terdiri dari dua warna", is_correct: false, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 93, statement: "Candi Prambanan adalah candi Buddha", is_correct: false, category: "Pengetahuan Umum", difficulty: "Sedang" },
  { id: 94, statement: "Gunung Bromo terletak di Jawa Timur", is_correct: true, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 95, statement: "Danau Toba adalah danau vulkanik terbesar di dunia", is_correct: true, category: "Pengetahuan Umum", difficulty: "Sulit" },
  { id: 96, statement: "Kota pahlawan di Indonesia adalah Bandung", is_correct: false, category: "Pengetahuan Umum", difficulty: "Mudah" },
  { id: 97, statement: "Komodo hanya bisa ditemukan di Indonesia", is_correct: true, category: "Biologi", difficulty: "Mudah" },
  { id: 98, statement: "Satu kilobyte sama dengan 1024 byte", is_correct: true, category: "Teknologi", difficulty: "Sedang" },
  { id: 99, statement: "Keyboard komputer standar menggunakan tata letak QWERTZ", is_correct: false, category: "Teknologi", difficulty: "Mudah" },
  { id: 100, statement: "Bumi memiliki lebih dari satu satelit alami", is_correct: false, category: "Sains", difficulty: "Mudah" },

  // New Additions (Extra questions to reach > 100 and allow up to 30 selected)
  { id: 104, statement: "Bumi berputar pada porosnya dari barat ke timur", is_correct: true, category: "Sains", difficulty: "Sedang" },
  { id: 105, statement: "Hiu tidak memiliki tulang", is_correct: true, category: "Biologi", difficulty: "Sulit" }, // Mereka punya tulang rawan
  { id: 106, statement: "Suhu terendah yang mungkin dicapai adalah 0 derajat Celcius", is_correct: false, category: "Sains", difficulty: "Sedang" }, // 0 Kelvin
  { id: 107, statement: "Mata uang Korea Selatan adalah Yen", is_correct: false, category: "Geografi", difficulty: "Mudah" },
  { id: 108, statement: "Pohon kelapa bisa tumbuh di iklim dingin", is_correct: false, category: "Biologi", difficulty: "Mudah" },
  { id: 109, statement: "Laba-laba memiliki 8 kaki", is_correct: true, category: "Biologi", difficulty: "Mudah" },
  { id: 110, statement: "Singa jantan adalah yang berburu dalam kawanan singa", is_correct: false, category: "Biologi", difficulty: "Sedang" }, // Betina yang berburu
  { id: 111, statement: "Kelelawar tidur dengan posisi terbalik", is_correct: true, category: "Biologi", difficulty: "Mudah" },
  { id: 112, statement: "Planet yang dijuluki Planet Merah adalah Mars", is_correct: true, category: "Sains", difficulty: "Mudah" },
  { id: 113, statement: "Cahaya merambat lurus", is_correct: true, category: "Sains", difficulty: "Sedang" },
  { id: 114, statement: "Unta menyimpan air di punuknya", is_correct: false, category: "Biologi", difficulty: "Sedang" }, // Menyimpan lemak
  { id: 115, statement: "Burung dodo masih belum punah", is_correct: false, category: "Biologi", difficulty: "Mudah" }
];

function getRandomQuestions(count = 10, difficulty = "Campuran") {
  let filtered = [...questions];
  if (difficulty && difficulty !== "Campuran") {
    filtered = questions.filter(q => q.difficulty === difficulty);
  }
  
  // Jika soal dengan difficulty tersebut kurang dari count, kita tambahkan sisanya dari soal lain agar tidak crash
  if (filtered.length < count) {
    const others = questions.filter(q => q.difficulty !== difficulty);
    // Shuffle others
    others.sort(() => 0.5 - Math.random());
    filtered = filtered.concat(others.slice(0, count - filtered.length));
  }

  // Shuffle the filtered list
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, count);
}

module.exports = { questions, getRandomQuestions };
