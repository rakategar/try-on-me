# Test Skeleton Detection ✨

## 🎯 Cara menggunakan halaman test ini:

### 1. Simpan gambar test
Simpan gambar yang ingin ditest dengan nama `test-image.jpg` di folder `/home/raka/try-on-me/public/`

Contoh command:
```bash
# Jika gambar ada di Downloads
cp ~/Downloads/your-image.jpg /home/raka/try-on-me/public/test-image.jpg

# Atau bisa langsung save gambar dari browser ke public/test-image.jpg
```

**PENTING:** Gambar harus berformat JPG/JPEG dan ukuran maksimal 5MB untuk performa optimal.

### 2. Buka halaman test

**Dari localhost:**
```
http://localhost:3000/test-skeleton
```

**Dari ngrok (mobile):**
```
https://0d170ee46cce.ngrok-free.app/test-skeleton
```

### 3. Hasil yang akan terlihat:

- ✅ Gambar asli ditampilkan
- 🟢 Skeleton hijau menghubungkan titik-titik tubuh
- 💜 Titik magenta di wajah (hidung, mata, telinga)
- 💙 Titik cyan di lengan (bahu, siku, pergelangan tangan)
- 💛 Titik kuning di pinggul
- 🧡 Titik orange di kaki (lutut, pergelangan kaki)
- 📝 Label nama pada setiap titik

### 4. Download hasil:

**2 Tombol Download tersedia:**

1. **📥 Download Hasil (Gambar + Skeleton)** - Hijau
   - Download gambar lengkap dengan skeleton overlay
   - Format: PNG dengan background gambar asli
   - Nama file: `skeleton-result-[timestamp].png`

2. **📥 Download Skeleton Only (Transparan)** - Biru
   - Download hanya skeleton tanpa background
   - Format: PNG dengan background transparan
   - Cocok untuk compositing di aplikasi lain
   - Nama file: `skeleton-overlay-[timestamp].png`

**Catatan:**
- Tombol akan AKTIF (berwarna) setelah skeleton selesai di-render (2-3 detik)
- Jika tombol masih abu-abu, tunggu hingga status menunjukkan "✅ Skeleton rendered!"
- File akan otomatis tersimpan di folder Downloads browser Anda

### 5. Troubleshooting:

**Jika skeleton tidak muncul:**
- Buka browser console (F12) untuk melihat log
- Pastikan gambar sudah ter-load (cek status di halaman)
- Tunggu 2-3 detik, skeleton akan di-render otomatis
- Cek console log: "Image drawn on result canvas" dan "Skeleton drawing complete on both canvases!"

**Jika gambar tidak muncul:**
- Pastikan file ada di `/public/test-image.jpg`
- Cek permission file: `chmod 644 /home/raka/try-on-me/public/test-image.jpg`
- Refresh halaman (Ctrl+R atau Cmd+R)

**Jika tombol download tidak aktif:**
- Tunggu hingga status menunjukkan "✅ Skeleton rendered! 17 points"
- Tombol akan berubah dari abu-abu menjadi hijau/biru
- Jika masih tidak aktif, buka console dan cari error

**Jika download tidak jalan:**
- Pastikan browser tidak memblokir popup/download
- Cek folder Downloads browser Anda
- Coba klik tombol lagi

### 6. Adjust koordinat skeleton:

Jika skeleton tidak pas dengan posisi tubuh di gambar, edit file:
`/home/raka/try-on-me/src/app/test-skeleton/page.tsx`

Di bagian `landmarks`, adjust nilai x dan y (0.0 - 1.0):
```javascript
{ name: 'left_shoulder', x: 0.42, y: 0.22 },
// x = posisi horizontal (0=kiri, 1=kanan)
// y = posisi vertical (0=atas, 1=bawah)
```

## 📊 Struktur Skeleton:

17 titik landmark:
- 0-4: Wajah (nose, eyes, ears)
- 5-10: Lengan (shoulders, elbows, wrists)
- 11-12: Pinggul (hips)
- 13-16: Kaki (knees, ankles)

21 koneksi garis yang menghubungkan titik-titik tersebut.
