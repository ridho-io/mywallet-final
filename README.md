# Finance App - Pengelola Keuangan Pribadi

Aplikasi mobile pengelola keuangan pribadi yang dibangun dengan React Native, Expo, dan Supabase. Mengusung desain modern Liquid Glass ala iOS 16 dengan animasi yang mulus.

## ✨ Fitur Utama

-   Otentikasi Pengguna (Email & Password)
-   Dashboard Ringkasan Keuangan
-   Pencatatan Transaksi (Pemasukan & Pengeluaran)
-   Manajemen Budget Bulanan per Kategori
-   Fitur Tabungan & Impian (Savings Goals)
-   Profil Pengguna

## 🛠️ Teknologi yang Digunakan

-   **Framework:** React Native (Expo)
-   **Navigasi:** Expo Router
-   **Bahasa:** TypeScript
-   **Backend & Database:** Supabase
-   **Animasi:** Moti (Framer Motion for React Native)
-   **Styling:** StyleSheet (Vanilla), Expo Blur, Expo Linear Gradient

## 🚀 Pengaturan & Menjalankan Aplikasi

### 1. Prasyarat

-   Node.js (LTS)
-   Expo CLI (`npm install -g expo-cli`)
-   Git

### 2. Kloning Repository

```bash
git clone [https://github.com/URL_REPO_ANDA.git](https://github.com/URL_REPO_ANDA.git)
cd finance-app
```

### 3. Instalasi Dependensi

```bash
npm install
```
atau
```bash
npx expo install
```

### 4. Konfigurasi Supabase

1.  Buat file `.env` di root proyek.
2.  Salin isi dari `.env.example` (jika ada) atau gunakan format di bawah.
3.  Isi dengan kredensial dari dashboard Supabase Anda (**Project Settings > API**).

    ```
    EXPO_PUBLIC_SUPABASE_URL=URL_PROYEK_ANDA
    EXPO_PUBLIC_SUPABASE_ANON_KEY=KUNCI_ANON_ANDA
    ```

### 5. Jalankan Aplikasi

Jalankan server development Expo:

```bash
npx expo start
```

Pindai kode QR menggunakan aplikasi Expo Go di perangkat iOS atau Android Anda, atau jalankan di simulator.

---