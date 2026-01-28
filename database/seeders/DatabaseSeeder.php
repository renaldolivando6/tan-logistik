<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. User
        DB::table('users')->insert([
            'name' => 'Owner TAN',
            'email' => 'owner@tan.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Kendaraan (3 kendaraan)
        $kendaraan = [
            ['nomor_polisi' => 'B 1234 CD', 'jenis' => 'Tronton', 'merk' => 'Hino', 'tahun' => 2020, 'kapasitas_ton' => 8.00],
            ['nomor_polisi' => 'B 5678 EF', 'jenis' => 'Engkel', 'merk' => 'Mitsubishi', 'tahun' => 2021, 'kapasitas_ton' => 3.50],
            ['nomor_polisi' => 'B 9012 GH', 'jenis' => 'CDE', 'merk' => 'Isuzu', 'tahun' => 2019, 'kapasitas_ton' => 5.00],
        ];

        foreach ($kendaraan as $k) {
            DB::table('kendaraan')->insert([
                ...$k,
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Lokasi (5 kota)
        $lokasi = [
            'Jakarta',
            'Surabaya',
            'Bandung',
            'Semarang',
            'Yogyakarta',
        ];

        foreach ($lokasi as $kota) {
            DB::table('lokasi')->insert([
                'nama_kota' => $kota,
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Kategori Biaya (NO TRIP - hanya maintenance & umum)
        $kategoriBiaya = [
            // Maintenance
            ['nama' => 'Ganti Oli', 'tipe' => 'maintenance'],
            ['nama' => 'Servis Rutin', 'tipe' => 'maintenance'],
            ['nama' => 'Ganti Ban', 'tipe' => 'maintenance'],
            ['nama' => 'Ganti Aki', 'tipe' => 'maintenance'],
            ['nama' => 'Sparepart', 'tipe' => 'maintenance'],
            // Umum
            ['nama' => 'Listrik Kantor', 'tipe' => 'umum'],
            ['nama' => 'Sewa Kantor', 'tipe' => 'umum'],
            ['nama' => 'Gaji Staff', 'tipe' => 'umum'],
        ];

        foreach ($kategoriBiaya as $kb) {
            DB::table('kategori_biaya')->insert([
                ...$kb,
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Trips (3 trip - simple, no pengembalian logic)
        $trips = [
            [
                'tanggal_trip' => now()->subDays(10)->toDateString(),
                'kendaraan_id' => 1,
                'asal_id' => 1, // Jakarta
                'tujuan_id' => 2, // Surabaya
                'uang_sangu' => 2000000,
                'status' => 'selesai',
                'catatan_trip' => 'Pengiriman barang ke Surabaya',
            ],
            [
                'tanggal_trip' => now()->subDays(5)->toDateString(),
                'kendaraan_id' => 2,
                'asal_id' => 1, // Jakarta
                'tujuan_id' => 3, // Bandung
                'uang_sangu' => 1000000,
                'status' => 'selesai',
                'catatan_trip' => 'Kirim ke distributor Bandung',
            ],
            [
                'tanggal_trip' => now()->subDays(2)->toDateString(),
                'kendaraan_id' => 1,
                'asal_id' => 2, // Surabaya
                'tujuan_id' => 4, // Semarang
                'uang_sangu' => 1500000,
                'status' => 'sedang_jalan',
                'catatan_trip' => 'Trip ke Semarang',
            ],
        ];

        foreach ($trips as $t) {
            DB::table('trips')->insert([
                ...$t,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Biaya Maintenance (5 transaksi)
        $biayaMaintenance = [
            // Maintenance kendaraan 1
            [
                'tanggal' => now()->subDays(15)->toDateString(),
                'kendaraan_id' => 1,
                'kategori_id' => 1, // Ganti Oli
                'jumlah' => 500000,
                'keterangan' => 'Ganti oli mesin + filter',
            ],
            [
                'tanggal' => now()->subDays(12)->toDateString(),
                'kendaraan_id' => 1,
                'kategori_id' => 2, // Servis Rutin
                'jumlah' => 800000,
                'keterangan' => 'Servis 10.000 km',
            ],
            // Maintenance kendaraan 2
            [
                'tanggal' => now()->subDays(8)->toDateString(),
                'kendaraan_id' => 2,
                'kategori_id' => 3, // Ganti Ban
                'jumlah' => 1200000,
                'keterangan' => 'Ganti 2 ban depan',
            ],
            // Biaya Umum (no kendaraan)
            [
                'tanggal' => now()->subDays(3)->toDateString(),
                'kendaraan_id' => null,
                'kategori_id' => 6, // Listrik Kantor
                'jumlah' => 750000,
                'keterangan' => 'Listrik bulan ini',
            ],
            [
                'tanggal' => now()->subDays(1)->toDateString(),
                'kendaraan_id' => null,
                'kategori_id' => 7, // Sewa Kantor
                'jumlah' => 3000000,
                'keterangan' => 'Sewa kantor bulan ini',
            ],
        ];

        foreach ($biayaMaintenance as $b) {
            DB::table('biaya_maintenance')->insert([
                ...$b,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}