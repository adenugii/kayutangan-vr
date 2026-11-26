// Data tour Kayutangan 360 — semua konten dipisah dari logika.
// yaw  : derajat ke KANAN dari arah pandang awal (0 = lurus ke depan, negatif = kiri)
// pitch: derajat ke ATAS dari cakrawala (negatif = ke bawah)
// Nilai infoYaw/infoPitch masih PERKIRAAN — kalibrasi dengan membuka index.html?debug=1
// lalu klik pada panorama untuk membaca yaw/pitch yang tepat.
const TOUR = {
  locations: [
    {
      id: 1, slug: 'gerbang-kampung', name: 'Gerbang Kampung',
      desc: 'Akses utama dari Jl. Basuki Rahmat. Kampung tua tersembunyi di balik pertokoan kolonial yang diresmikan sebagai kampung wisata sejak 2018.',
      audio: null, // contoh: 'assets/audio/01-gerbang-kampung.mp3'
      views: [
        { src: 'assets/panorama/01-gerbang-kampung-1.jpg', infoYaw: -70, infoPitch: 5 }
      ]
    },
    {
      id: 2, slug: 'rumah-1870', name: 'Rumah 1870',
      desc: 'Rumah tertua yang tercatat di Kayutangan, menampilkan ciri khas arsitektur kolonial awal gaya Batavia.',
      audio: null,
      views: [
        { src: 'assets/panorama/02-rumah-1870-1.jpg', infoYaw: -8, infoPitch: 5 },
        { src: 'assets/panorama/02-rumah-1870-2.jpg', infoYaw: -20, infoPitch: 5 }
      ]
    },
    {
      id: 3, slug: 'kedai-namsin', name: 'Kedai Namsin',
      // TODO: konfirmasi apakah narasi perlu disesuaikan karena kini berupa "kedai"
      desc: 'Memiliki ornamen mahkota pada bagian atas bangunan sebagai simbol status sosial pemiliknya sebagai saudagar sukses.',
      audio: null,
      views: [
        { src: 'assets/panorama/03-kedai-namsin-1.jpg', infoYaw: -18, infoPitch: 5 }
      ]
    },
    {
      id: 4, slug: 'rumah-jengki', name: 'Rumah Jengki',
      desc: 'Dibangun pada era 1960-an dengan atap miring asimetris khas gaya Jengki pasca-kemerdekaan, kontras dengan rumah kolonial.',
      audio: null,
      views: [
        { src: 'assets/panorama/04-rumah-jengki-1.jpg', infoYaw: -100, infoPitch: 5 },
        { src: 'assets/panorama/04-rumah-jengki-2.jpg', infoYaw: -58, infoPitch: 5 }
      ]
    },
    {
      id: 5, slug: 'mbah-ndut', name: 'Rumah & Warung Mbah Ndut',
      desc: "Dibangun tahun 1923, terkait sejarah perjuangan keluarga Mardikyah. Kata 'Hamur' adalah bahasa walikan Malang yang berarti Rumah.",
      audio: null,
      views: [
        { src: 'assets/panorama/05-mbah-ndut-1.jpg', infoYaw: -10, infoPitch: 5 }
      ]
    },
    {
      id: 6, slug: 'makam-mbah-honggo', name: 'Makam Mbah Honggo',
      desc: 'Makam Pangeran Honggokusumo (sekitar 1830), tokoh penyebar agama Islam di Kayutangan pasca Perang Diponegoro. Mohon menjaga sopan santun saat berkunjung.',
      audio: null,
      views: [
        { src: 'assets/panorama/06-makam-mbah-honggo-1.jpg', infoYaw: 0, infoPitch: 5 },
        { src: 'assets/panorama/06-makam-mbah-honggo-2.jpg', infoYaw: 0, infoPitch: 5 },
        { src: 'assets/panorama/06-makam-mbah-honggo-3.jpg', infoYaw: 0, infoPitch: 5 }
      ]
    },
    {
      id: 7, slug: 'pasar-krempyeng', name: 'Pasar Krempyeng',
      desc: 'Pasar tradisional pagi di tengah kampung, pusat ekonomi warga Kayutangan.',
      audio: null,
      views: [
        { src: 'assets/panorama/07-pasar-krempyeng-1.jpg', infoYaw: 0, infoPitch: 5 },
        { src: 'assets/panorama/07-pasar-krempyeng-2.jpg', infoYaw: 0, infoPitch: 5 }
      ]
    },
    {
      id: 8, slug: 'sungai', name: 'Sungai',
      // TODO: narasi Sungai belum ada di dokumen P1 — teks sementara
      desc: 'Aliran sungai yang membelah kampung. (Narasi lengkap menyusul.)',
      audio: null,
      views: [
        { src: 'assets/panorama/08-sungai-1.jpg', infoYaw: -18, infoPitch: 5 }
      ]
    }
  ],

  // 5 soal (spesifikasi P1). Soal 1-3 dari prototipe, 4-5 draf baru dari materi dokumen — mohon ditinjau.
  quiz: [
    { q: "Apa arti kata 'Hamur' pada Warung Hamur Mbah Ndut dalam bahasa walikan Malang?", opts: ['Pasar', 'Rumah', 'Sungai'], ans: 1 },
    { q: 'Ornamen mahkota pada Kedai Namsin melambangkan status pemiliknya sebagai...', opts: ['Bangsawan Belanda', 'Saudagar', 'Seniman'], ans: 1 },
    { q: 'Gaya arsitektur pasca-kemerdekaan tahun 1960-an di Kayutangan disebut gaya...', opts: ['Art Deco', 'Batavia', 'Jengki'], ans: 2 },
    { q: 'Sejak tahun berapa Kayutangan dikenal sebagai kampung wisata?', opts: ['2008', '2018', '2022'], ans: 1 },
    { q: 'Manakah rumah yang tercatat sebagai rumah tertua di Kayutangan?', opts: ['Rumah Jengki', 'Rumah 1870', 'Warung Hamur'], ans: 1 }
  ],

  // Ambang gelar (belum ditetapkan di dokumen P1 — nilai sementara, dalam persen)
  titles: [
    { min: 80, label: 'Pemandu Kayutangan' },
    { min: 50, label: 'Penjelajah Heritage' },
    { min: 0,  label: 'Coba Ulang' }
  ]
};
