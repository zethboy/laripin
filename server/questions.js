const questions = [
  { id: 1, statement: "Soekarno adalah presiden pertama Indonesia", is_correct: true, category: "Sejarah" },
  { id: 2, statement: "Air mendidih pada suhu 90 derajat celcius", is_correct: false, category: "Sains" },
  { id: 3, statement: "Gunung Everest adalah gunung tertinggi di dunia", is_correct: true, category: "Geografi" },
  { id: 4, statement: "Matahari adalah bintang terbesar di alam semesta", is_correct: false, category: "Sains" },
  { id: 5, statement: "Indonesia merdeka pada tanggal 17 Agustus 1945", is_correct: true, category: "Sejarah" },
  { id: 6, statement: "Jantung manusia memiliki 3 ruang", is_correct: false, category: "Biologi" },
  { id: 7, statement: "Bahasa resmi Brazil adalah Spanyol", is_correct: false, category: "Geografi" },
  { id: 8, statement: "Kupu-kupu merasakan rasa lewat kakinya", is_correct: true, category: "Fakta Unik" },
  { id: 9, statement: "Bumi mengelilingi matahari dalam 365 hari", is_correct: true, category: "Sains" },
  { id: 10, statement: "Paus adalah jenis ikan terbesar", is_correct: false, category: "Biologi" },
  { id: 11, statement: "Borobudur terletak di Jawa Tengah", is_correct: true, category: "Sejarah" },
  { id: 12, statement: "Manusia hanya menggunakan 10% dari otaknya", is_correct: false, category: "Mitos" },
  { id: 13, statement: "Kilat lebih cepat terlihat daripada petir terdengar", is_correct: true, category: "Sains" },
  { id: 14, statement: "Semut bisa mengangkat 50 kali berat tubuhnya", is_correct: true, category: "Fakta Unik" },
  { id: 15, statement: "Planet terbesar di tata surya adalah Saturnus", is_correct: false, category: "Sains" },
];

function getRandomQuestions(count = 10) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

module.exports = { questions, getRandomQuestions };
