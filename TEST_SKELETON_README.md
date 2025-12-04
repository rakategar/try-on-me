# Test Skeleton Detection

## 🎯 Cara menggunakan halaman test ini:

### 1. Simpan gambar test
Simpan gambar yang ingin ditest dengan nama `test-image.jpg` di folder `/home/raka/try-on-me/public/`

Contoh command:
```bash
# Jika gambar ada di Downloads
cp ~/Downloads/your-image.jpg /home/raka/try-on-me/public/test-image.jpg

# Atau bisa langsung save gambar dari browser ke public/test-image.jpg
```

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

### 4. Troubleshooting:

**Jika skeleton tidak muncul:**
- Buka browser console (F12) untuk melihat log
- Pastikan gambar sudah ter-load (cek status di halaman)
- Refresh halaman beberapa kali

**Jika gambar tidak muncul:**
- Pastikan file ada di `/public/test-image.jpg`
- Cek permission file: `chmod 644 /home/raka/try-on-me/public/test-image.jpg`

### 5. Adjust koordinat skeleton:

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
