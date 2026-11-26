# Project Context: Kayutangan 360 (WebVR Virtual Tour)

## 1. Overview & Architecture
- **Goal**: Web-based 360° virtual tour of Kampung Heritage Kayutangan, Malang, Indonesia.
- **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+), **A-Frame** (v1.5.0 via CDN). No build step required (static site deployable to Vercel/GitHub Pages).
- **Target Devices**: Mobile browsers (Android Chrome primary; iOS Safari fallback). Two viewing modes:
  1. **Normal Mode**: Touch/drag look-around + on-screen HUD buttons (DOM overlay).
  2. **VR Cardboard Mode**: Stereoscopic split-screen (`vr-mode-ui`) + gaze cursor (`fuse: true`, 1500ms) for hands-free interaction. DOM overlays are NOT visible in split-screen, so navigation/info use 3D entities in this mode.
- **Platform Constraint**: On iOS Safari, `DeviceOrientationEvent` permission can restrict gyroscope look-around. Touch-drag (`look-controls`) must keep working as fallback.

## 2. Project Structure
```
VR Kayutangan 360/
├─ Aset Foto 360/            ← foto ASLI (±7 MB/foto), di luar repo, tidak di-deploy
├─ LAPORAN FINAL PROJECT P1 - Realitas Terkembang.pdf
└─ kayutangan-vr/            ← repo git (yang di-deploy)
   ├─ index.html             ← markup: landing, HUD, modal, <a-scene>
   ├─ CONTEXT_VR.md
   ├─ css/style.css
   ├─ js/
   │  ├─ tour-data.js        ← SEMUA konten: 8 titik, sudut, hotspot, kuis, ambang gelar
   │  ├─ components.js       ← komponen A-Frame: hotspot-info, portal-nav, tour-manager
   │  └─ app.js              ← logika UI: mode, HUD, menu, info/audio, kuis
   └─ assets/
      ├─ panorama/           ← foto hasil kompresi 4096x2048 (±1 MB), NN-slug-sudut.jpg
      ├─ audio/              ← narasi NN-slug.mp3 (belum ada)
      └─ img/                ← ikon/logo (belum ada)
```
Foto asli → `assets/panorama/`: resize 4096×2048, JPEG q80 progressive (±136 MB → ±14 MB). Foto berawalan `GS__` di folder asli adalah cadangan dan diabaikan.

## 3. Tour Locations (8 Points, revisi dari P1 yang 7 titik)
Revisi: "Rumah Namsin" → **Kedai Namsin**; "Pasar Krempyeng & Sungai" dipisah jadi dua titik. Beberapa titik punya **lebih dari satu sudut pandang (angle)** — pengguna berpindah antar sudut dengan tombol "Ganti Sudut" / portal 3D.

| # | Titik | Sudut | Catatan konten |
|---|---|---|---|
| 1 | Gerbang Kampung | 1 | Jl. Basuki Rahmat; kampung tua di balik pertokoan; kampung wisata sejak 2018 |
| 2 | Rumah 1870 | 2 | Rumah tertua tercatat; kolonial awal (Batavia) |
| 3 | Kedai Namsin | 1 | Ornamen mahkota = status saudagar (narasi masih dari "rumah", perlu konfirmasi) |
| 4 | Rumah Jengki | 2 | Era 1960-an, atap miring asimetris |
| 5 | Rumah & Warung Mbah Ndut | 1 | 1923; keluarga Mardikyah; "Hamur" = Rumah (boso walikan) |
| 6 | Makam Mbah Honggo | 3 | Pangeran Honggokusumo (±1830), penyebar Islam; pengingat sopan santun |
| 7 | Pasar Krempyeng | 2 | Pasar tradisional pagi di tengah kampung |
| 8 | Sungai | 1 | **Narasi belum ada** (teks sementara) |

## 4. Core Functional Requirements (From P1 Spec)
- **VR-01 & VR-02**: Landing dengan judul "Kayutangan 360", pengantar, pilihan mode (Normal vs Cardboard), tombol "Mulai Tour".
- **VR-03 & VR-04**: Muat panorama equirectangular (`<a-sky>`) titik pertama saat tour dimulai. Ada indikator "Memuat panorama…".
- **VR-05**: Look-around via sentuh/geser atau giroskop.
- **VR-06 & VR-07**: Hotspot info (ikon `i`) di ruang 3D; klik/fuse membuka panel teks + narasi audio (patuhi kebijakan autoplay). Normal: modal DOM. Cardboard: panel 3D.
- **VR-08**: Navigasi 8 titik lewat portal panah 3D DAN menu lompat titik (`n/8`); ditambah pergantian sudut pandang.
- **VR-09**: Kuis pilihan ganda 5 soal setelah titik terakhir, umpan balik benar/salah langsung, layar skor dengan gelar ("Pemandu Kayutangan", "Penjelajah Heritage", "Coba Ulang").
- **VR-10**: Tombol Keluar → kembali ke landing, hentikan audio, keluar mode VR.

## 5. Coding Conventions for AI Agent
- Semua data (judul, deskripsi, path panorama/audio, yaw/pitch hotspot, soal kuis) HANYA di `js/tour-data.js`. Menambah sudut/titik = menambah entri di sana.
- Hotspot memakai **yaw/pitch** (derajat; yaw 0 = arah pandang awal, positif = kanan; pitch positif = atas). Nilai `infoYaw/infoPitch` saat ini PERKIRAAN. Kalibrasi: buka `index.html?debug=1`, klik titik pada panorama → yaw/pitch muncul di toast & console.
- Komponen A-Frame lewat `AFRAME.registerComponent`. **Jangan pakai `get` accessor** di definisi komponen (tidak terbaca) — pakai method biasa.
- Lapisan `#hotspot-layer` mengikuti posisi kamera tiap frame (`tick` di tour-manager) agar sudut hotspot akurat di mode biasa maupun Cardboard.
- `a-sky` harus `color="#ffffff"` — warna lain akan menggelapkan tekstur panorama.
- Nama file panorama: `NN-slug-sudut.jpg` (mis. `04-rumah-jengki-2.jpg`).

## 6. Status & Keputusan Terbuka
**Sudah ada**: struktur, 8 titik + 13 panorama, multi-sudut, HUD, menu titik, modal info, panel info 3D, kuis 5 soal + skor, mode debug kalibrasi. Alur sudah diuji otomatis di browser (mode layar biasa).
**Belum / perlu diputuskan**:
1. Narasi audio belum ada (`audio: null`); naskah & rekaman perlu dibuat. Narasi Sungai & kecocokan narasi Kedai Namsin.
2. Kuis soal 4–5 adalah draf baru; ambang gelar (80/50) sementara — P1 tidak menetapkan.
3. Posisi hotspot masih perkiraan → kalibrasi per sudut pandang.
4. Kuis dibuka hanya setelah titik terakhir (konflik P1: flow chart menampilkannya sebagai pilihan kapan saja). Di Cardboard, kuis keluar dari mode VR ke layar biasa — jawab kuis di split-screen belum didukung.
5. Mode Cardboard belum diuji di HP nyata; klaim dukungan WebXR di Safari pada P1 perlu dibuktikan. Hosting harus HTTPS agar sensor gerak berfungsi.
6. Foto menampilkan tangan/bayangan fotografer di bagian bawah (nadir) — pertimbangkan menutup dengan logo/patch.
7. Bagian 3.7 P1 (rancangan antarmuka) kosong; tampilan saat ini masih prototipe fungsional.
