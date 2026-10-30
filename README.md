# SiAbsen — Smart Employee Attendance System ☁️
> *"Hadir Tepat, Kerja Hebat."*

Sistem manajemen kehadiran dan administrasi karyawan modern berbasis **React Native & Expo (Web, Android & iOS)** dengan identitas visual **Cloud Blue**, glassmorphism, serta alur presensi, validasi GPS geofencing, pengajuan cuti/izin/sakit dengan progress bar, dan alur persetujuan pimpinan (approval workflow) yang terintegrasi penuh.

---

## 🚀 Fitur Utama & Keunggulan

### 1. 🎨 Desain & Identitas Visual "Cloud Blue"
- **Palet Warna Harmonis & Elegan**:
  - Sky Blue: `#7CCBFF`
  - Primary Blue: `#3B9DF8`
  - Light Blue: `#EAF6FF`
  - Cloud White: `#FFFFFF`
  - Soft Navy: `#203B5C`
  - Success Green: `#35C98A`
  - Warning Orange: `#FFB454`
  - Error Red: `#F16B78`
- **Animasi & Micro-Interactions**:
  - Animasi awan melayang (*floating clouds*) di latar belakang login.
  - Kartu glassmorphism dengan elevasi bayangan halus (*smooth shadows*).
  - Jam digital real-time (WIB) dengan indikator denyut (*live pulse dot*).
  - Animasi **Checkmark Modal** saat absensi check-in berhasil dicatat.
  - **Animated Number Counter** pada kartu statistik dashboard.
  - **3-Step Progress Bar / Timeline** alur pengajuan cuti (Diajukan → Peninjauan HR/Pimpinan → Disetujui/Ditolak).
  - Indikator loading (*spinner*) pada tombol saat memproses presensi dan persetujuan.
  - Toast notification interaktif untuk umpan balik instan.

### 2. 🔐 Autentikasi & Multi-Role (Karyawan & Bos / Admin)
- **Akun Demo 1-Klik**:
  - 👨‍💻 **Karyawan**: `budi@siabsen.id` (Budi Pratama - Senior Frontend Engineer)
  - 👑 **Bos / Admin**: `hendra@siabsen.id` (Hendra Wijaya - COO & Head of HR)
- **Peralihan Akun Instan**: Tombol *"Ganti Akun Demo"* di header untuk menguji alur bolak-balik antara karyawan dan pimpinan secara langsung.
- **Reset Data Demo**: Tersedia tombol *"Reset Semua Data Demo"* di modal switcher dan pengaturan untuk mengembalikan data awal kapan saja.
- **Pembatasan Hak Akses**: Karyawan diblokir dari dashboard admin dan tidak dapat mengakses data pribadi staf lain.

### 3. ⏱️ Presensi Check-In & Check-Out Terintegrasi
- **Jam Digital Real-time (WIB)**: Detik berjalan terus-menerus dengan format tanggal resmi bahasa Indonesia.
- **Verifikasi Lokasi GPS & Geofencing**:
  - Koordinat Menara Mandiri Sudirman (-6.2255, 106.8093) dengan batas radius 250 meter.
  - Formula Haversine menghitung jarak aktual perangkat ke kantor secara presisi.
  - Opsi *"Gunakan GPS Asli Perangkat"* untuk mendeteksi koordinat nyata dari browser/ponsel atau mode simulasi kantor.
  - Pilihan mode kerja fleksibel: **WFO** (Work From Office) atau **WFH** (Work From Home).
- **Aturan Jadwal Kantor**: Jam masuk 08:30 WIB dengan toleransi keterlambatan 15 menit (hingga 08:45 WIB). Keterlambatan otomatis ditandai badge peringatan dan dihitung menitnya.
- **Live Counter Durasi Kerja**: Menghitung jam, menit, dan detik kerja secara aktual dari waktu check-in.
- **Pencegahan Duplikasi**: Sistem secara otomatis mengunci presensi ganda pada tanggal yang sama.

### 4. 📝 Formulir Pengajuan Cuti, Izin & Sakit
- **Cuti Tahunan**: Validasi kuota cuti. Pengurangan kuota otomatis setelah permohonan disetujui pimpinan.
- **Izin**: Keperluan mendesak, setengah hari, urusan kependudukan, duka cita.
- **Sakit**: Dilengkapi unggah dokumen / surat keterangan dokter (PDF/JPG).
- **Timeline Proses**: Progress bar 3 tahap memvisualisasikan status pengajuan secara transparan.
- **Pembatalan Mandiri**: Karyawan dapat membatalkan pengajuan yang masih berstatus *Menunggu Persetujuan*.

### 5. 👑 Dashboard & Persetujuan Bos (Approval Center)
- Ringkasan KPI: Total Karyawan Aktif, Hadir Hari Ini, Terlambat Hari Ini, Belum Absen, Sedang Cuti/Izin, Pengajuan Menunggu.
- **Grafik Tren Kehadiran Mingguan (SVG)** dihitung dinamis dari database absensi.
- **Distribusi Kehadiran Departemen** dengan progress bar persentase real-time per divisi.
- Tabel monitoring absensi hari ini dengan pencarian instan dan filter divisi.
- **Modal Keputusan**: Bos dapat memilih **Setujui** atau **Tolak** disertai catatan pimpinan yang langsung terkirim sebagai notifikasi ke dashboard karyawan.

### 6. 👥 Manajemen Karyawan (CRUD & History)
- Tambah staf baru dengan pengaturan divisi, jabatan, nomor handphone, jadwal shift, tanggal bergabung, dan kuota cuti awal.
- Edit profil pegawai dan opsi aktivasi/nonaktivasi akun staf.
- **Detail & Riwayat Presensi**: Modal khusus untuk melihat riwayat kehadiran lengkap masing-masing karyawan beserta jam masuk, jam pulang, dan durasi kerja.

### 7. 📑 Rekapitulasi & Ekspor Laporan
- Filter berdasarkan rentang bulan, divisi, dan pencarian nama karyawan.
- Rekap KPI: Total presensi masuk, hadir tepat waktu, total keterlambatan, akumulasi jam kerja, total cuti, izin, dan sakit.
- **Ekspor CSV / Excel**: Mengunduh spreadsheet `.csv` ber-BOM UTF-8 asli yang langsung rapi dibuka di Microsoft Excel.
- **Cetak Laporan**: Template lembar absensi resmi siap cetak lengkap dengan kop perusahaan dan kolom tanda tangan pengesahan pimpinan.

### 8. 🛡️ Keamanan & Integrasi Database Supabase (PostgreSQL)
- Skrip migrasi lengkap di `supabase/schema.sql`:
  - 6 Tabel: `profiles`, `company_settings`, `attendance`, `leave_requests`, `notifications`, `audit_logs`.
  - **Row Level Security (RLS)**: Hak akses terproteksi penuh di sisi database (karyawan hanya dapat melihat datanya sendiri; hanya admin yang dapat mengubah status persetujuan).
  - **Constraint Uniqueness**: `UNIQUE(user_id, date)` mencegah duplikasi presensi di level database.
  - **Server-side Stored Procedures**: `rpc_secure_check_in` dan `rpc_review_leave` menggunakan timestamp server `(NOW() AT TIME ZONE 'Asia/Jakarta')` untuk mencegah manipulasi waktu dari klien.
  - Adapter klien di `src/services/supabaseClient.ts` siap dihubungkan ke proyek Supabase dengan variabel lingkungan `.env`.

---

## 🛠️ Cara Menjalankan & Menguji Aplikasi

Aplikasi berada di direktori:
```bash
d:\SiAbsen
```

### 1. Jalankan di Browser (Web)
```bash
npm run web
```
*Aplikasi akan terbuka otomatis di `http://localhost:8081`.*

### 2. Jalankan Pengujian Otomatis (E2E Scenario Test)
```bash
npm test
```
*Menjalankan 10 skenario pengujian alur presensi, pencegahan duplikasi, pengajuan cuti, persetujuan admin, pemotongan kuota, dan verifikasi hak akses.*

### 3. Jalankan di Ponsel (Android / iOS)
```bash
npx expo start
```
*Pindai QR code menggunakan aplikasi **Expo Go** di ponsel Anda.*

---

## 🧪 12 Skenario Pengujian Alur Kerja (End-to-End)

| No | Skenario Uji | Cara Menguji | Hasil yang Diharapkan |
|---|---|---|---|
| 1 | **Login Karyawan** | Buka halaman Login → Klik *"Login Karyawan"* (Budi Pratama) | Masuk ke Dashboard Karyawan, menyapa *"Selamat pagi, Budi Pratama ☁️"* |
| 2 | **Check-In Presensi** | Buka tab *"Absen"* → Pilih WFO/WFH → Klik *"Lakukan Check-In Masuk"* | Tombol loading → Muncul animasi **Checkmark Modal** → Status berubah *"Sedang Bekerja"* |
| 3 | **Pencegahan Check-In Ganda** | Coba check-in kembali di hari yang sama | Tombol check-in nonaktif dan berganti menjadi tombol *"Lakukan Check-Out Pulang"* |
| 4 | **Check-Out Presensi** | Klik tombol *"Lakukan Check-Out Pulang"* | Jam pulang tercatat, total durasi kerja dihitung otomatis (Jam & Menit) |
| 5 | **Pengajuan Cuti** | Buka menu *"Cuti/Izin"* → Pilih Cuti Tahunan (3 Hari) → Isi Alasan → Kirim | Pengajuan berstatus *"Menunggu"* dengan timeline progress bar 3 langkah |
| 6 | **Beralih ke Akun Bos** | Klik *"Ganti Akun Demo"* di Header → Pilih Hendra Wijaya (Admin) | Dashboard Admin terbuka, menampilkan pengajuan pending dari karyawan |
| 7 | **Persetujuan oleh Bos** | Buka menu *"Persetujuan"* → Klik *"Setujui"* → Isi catatan → Simpan | Status berubah *"Disetujui"*, kuota cuti karyawan terpotong otomatis |
| 8 | **Penolakan oleh Bos** | Buka menu *"Persetujuan"* → Klik *"Tolak"* pada pengajuan lain → Simpan | Status berubah *"Ditolak"*, catatan tersimpan, notifikasi dikirim ke staf |
| 9 | **Monitoring Real-time** | Periksa tabel di Dashboard Admin | Data presensi karyawan langsung tersinkronisasi secara real-time |
| 10 | **Proteksi Hak Akses** | Login sebagai Budi Pratama | Menu dan layar admin tidak dapat diakses oleh staf biasa |
| 11 | **Laporan & Ekspor Data** | Buka menu *"Rekap"* → Filter divisi/bulan → Klik *"Ekspor CSV"* / *"Cetak"* | File CSV terunduh dengan rapi; lembar laporan siap dicetak |
| 12 | **Responsif Smartphone** | Buka aplikasi di layar kecil (<860px) | Drawer navigasi samping dan Bottom Tab Bar muncul dengan mulus |

---

## 📁 Struktur Direktori Proyek

```
d:\SiAbsen/
├── App.tsx                         # Navigasi utama, header, sidebar & drawer responsif
├── app.json                        # Konfigurasi Expo & Web branding
├── package.json                    # Dependensi proyek & script runner
├── scripts/
│   └── test-all-scenarios.ts       # Script pengujian otomatis 10 skenario E2E
├── supabase/
│   └── schema.sql                  # Skrip PostgreSQL (RLS, tables, RPC functions, audit logs)
├── src/
│   ├── types/
│   │   └── index.ts                # Definisi tipe User, Attendance, LeaveRequest, Settings
│   ├── constants/
│   │   └── theme.ts                # Palet warna Cloud Blue & shadow presets
│   ├── mock/
│   │   └── initialData.ts          # Data awal presensi, staf, pengajuan & notifikasi dinamis
│   ├── context/
│   │   └── AppContext.tsx          # State management (AsyncStorage persistence & business logic)
│   ├── services/
│   │   └── supabaseClient.ts       # Klien adapter integrasi Supabase RPC
│   ├── components/
│   │   ├── Badge.tsx               # Komponen badge status berwarna
│   │   ├── CheckmarkModal.tsx      # Animasi checkmark modal saat absensi sukses
│   │   ├── CloudBackground.tsx     # Animasi awan melayang di latar belakang
│   │   ├── DigitalClock.tsx        # Jam digital real-time dengan zona WIB
│   │   ├── Header.tsx              # Bar atas dengan notifikasi, avatar, dan role switcher
│   │   ├── Modal.tsx               # Komponen modal dialog responsif
│   │   ├── RequestProgressBar.tsx  # Timeline progress bar 3-tahap status permohonan
│   │   ├── Sidebar.tsx             # Navigasi bilah samping desktop
│   │   ├── StatCard.tsx            # Kartu metrik dengan animasi counter angka
│   │   └── Toast.tsx               # Notifikasi toast mengambang
│   └── screens/
│       ├── LoginScreen.tsx         # Halaman login dengan akses demo 1-klik & reset password
│       ├── EmployeeDashboardScreen.tsx # Dashboard karyawan dengan live timer & ringkasan
│       ├── AttendanceScreen.tsx    # Portal presensi GPS geofence, WFO/WFH, dan check-in/out
│       ├── LeaveRequestScreen.tsx  # Formulir pengajuan cuti, izin, sakit & riwayat status
│       ├── HistoryScreen.tsx       # Riwayat presensi historis lengkap karyawan
│       ├── AdminDashboardScreen.tsx# Dashboard eksekutif dengan grafik tren mingguan & filter
│       ├── ApprovalScreen.tsx      # Pusat persetujuan pengajuan permohonan oleh pimpinan
│       ├── EmployeeManagementScreen.tsx # CRUD karyawan & modal riwayat kehadiran per staf
│       ├── ReportScreen.tsx        # Rekapitulasi absensi bulanan, ekspor CSV, dan cetak
│       ├── SettingsScreen.tsx      # Pengaturan jadwal kantor, radius GPS & reset data demo
│       └── ProfileScreen.tsx       # Kelola profil akun, ubah nomor kontak & ganti kata sandi
```

---

*SiAbsen — Hadir Tepat, Kerja Hebat.* ☁️
