# Laporan Uji Role Authorization — Pertemuan 14

**Nama:** Nia Astuti
**NIM:** 0112523027
**Tanggal pengujian:** 10 Juli 2026
**Tools:** Postman

## Akun Uji

| Role | Email |
|---|---|
| admin | admin@kampus.ac.id |
| operator | operator@kampus.ac.id |
| viewer | viewer@kampus.ac.id |

## Metode Pengujian

Setiap akun di-login melalui endpoint `POST /api/auth/login` untuk mendapatkan token JWT. Token tersebut kemudian digunakan pada header `Authorization: Bearer <token>` untuk mengakses endpoint mahasiswa (`/api/db/mahasiswa`), sesuai role masing-masing akun.

## Hasil Pengujian Endpoint Mahasiswa

| Endpoint | Admin | Operator | Viewer |
|---|---|---|---|
| GET /api/db/mahasiswa | 200 OK | 200 OK | 200 OK |
| POST /api/db/mahasiswa | 201 Created | 201 Created | 403 Forbidden |
| PUT /api/db/mahasiswa/:id | 200 OK | 200 OK | 403 Forbidden |
| DELETE /api/db/mahasiswa/:id | 200 OK | 403 Forbidden | 403 Forbidden |

## Kesimpulan

Middleware `allowRoles` berhasil membatasi akses endpoint mahasiswa sesuai role pengguna:

- **Admin** memiliki akses penuh ke seluruh endpoint (lihat, tambah, ubah, hapus data mahasiswa).
- **Operator** dapat melihat, menambah, dan mengubah data mahasiswa, tetapi tidak dapat menghapus data — percobaan `DELETE` menghasilkan status `403 Forbidden` dengan pesan "Anda tidak memiliki akses ke fitur ini".
- **Viewer** hanya dapat melihat data (`GET`). Percobaan menambah (`POST`), mengubah (`PUT`), dan menghapus (`DELETE`) data seluruhnya ditolak dengan status `403 Forbidden`.

Hasil pengujian ini sesuai dengan matriks proteksi endpoint yang ditentukan pada modul Pertemuan 14, sehingga implementasi role authorization dinyatakan berhasil.
