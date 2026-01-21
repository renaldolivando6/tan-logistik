<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // User
        DB::table('users')->insert([
            'name' => 'Owner TAN',
            'email' => 'owner@tan.com',
            'password' => Hash::make('12345678'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Kendaraan
        $kendaraan = [
            ['nomor_polisi' => 'L 1234 AB', 'jenis' => 'Truk Fuso', 'merk' => 'Mitsubishi', 'tahun' => 2020, 'kapasitas_ton' => 8],
            ['nomor_polisi' => 'L 5678 CD', 'jenis' => 'Truk Engkel', 'merk' => 'Hino', 'tahun' => 2019, 'kapasitas_ton' => 5],
            ['nomor_polisi' => 'W 9012 EF', 'jenis' => 'Pickup Box', 'merk' => 'Isuzu', 'tahun' => 2021, 'kapasitas_ton' => 2],
        ];

        foreach ($kendaraan as $k) {
            DB::table('kendaraan')->insert([
                ...$k,
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Kategori Biaya
        $kategoriBiaya = [
            // Trip
            ['nama' => 'Solar', 'tipe' => 'trip'],
            ['nama' => 'Tol', 'tipe' => 'trip'],
            ['nama' => 'Parkir', 'tipe' => 'trip'],
            ['nama' => 'Makan', 'tipe' => 'trip'],
            // Maintenance
            ['nama' => 'Servis Rutin', 'tipe' => 'maintenance'],
            ['nama' => 'Ganti Oli', 'tipe' => 'maintenance'],
            ['nama' => 'Ganti Ban', 'tipe' => 'maintenance'],
            ['nama' => 'Ganti Accu', 'tipe' => 'maintenance'],
            ['nama' => 'Sparepart', 'tipe' => 'maintenance'],
            // Umum
            ['nama' => 'Listrik Kantor', 'tipe' => 'umum'],
            ['nama' => 'Sewa Kantor', 'tipe' => 'umum'],
            ['nama' => 'ATK', 'tipe' => 'umum'],
        ];

        foreach ($kategoriBiaya as $kb) {
            DB::table('kategori_biaya')->insert([
                ...$kb,
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Trips
        $trips = [
            ['tanggal_trip' => now()->subDays(10)->toDateString(), 'kendaraan_id' => 1, 'uang_sangu' => 2000000, 'status' => 'selesai', 'status_uang_sangu' => 'selesai'],
            ['tanggal_trip' => now()->subDays(5)->toDateString(), 'kendaraan_id' => 2, 'uang_sangu' => 1500000, 'status' => 'selesai', 'status_uang_sangu' => 'selesai'],
            ['tanggal_trip' => now()->subDays(2)->toDateString(), 'kendaraan_id' => 1, 'uang_sangu' => 1800000, 'status' => 'berangkat', 'status_uang_sangu' => 'belum_selesai'],
            ['tanggal_trip' => now()->toDateString(), 'kendaraan_id' => 3, 'uang_sangu' => 800000, 'status' => 'draft', 'status_uang_sangu' => 'belum_selesai'],
        ];

        foreach ($trips as $t) {
            DB::table('trips')->insert([
                ...$t,
                'total_biaya' => 0,
                'sisa_uang' => $t['uang_sangu'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Biaya Operasional
        $biaya = [
            // Trip 1 (selesai)
            ['tanggal' => now()->subDays(10)->toDateString(), 'trip_id' => 1, 'kendaraan_id' => 1, 'kategori_id' => 1, 'jumlah' => 800000, 'keterangan' => 'Solar full tank'],
            ['tanggal' => now()->subDays(10)->toDateString(), 'trip_id' => 1, 'kendaraan_id' => 1, 'kategori_id' => 2, 'jumlah' => 150000, 'keterangan' => 'Tol Surabaya-Malang'],
            ['tanggal' => now()->subDays(10)->toDateString(), 'trip_id' => 1, 'kendaraan_id' => 1, 'kategori_id' => 4, 'jumlah' => 50000, 'keterangan' => 'Makan sopir'],
            // Trip 2 (selesai)
            ['tanggal' => now()->subDays(5)->toDateString(), 'trip_id' => 2, 'kendaraan_id' => 2, 'kategori_id' => 1, 'jumlah' => 600000, 'keterangan' => 'Solar'],
            ['tanggal' => now()->subDays(5)->toDateString(), 'trip_id' => 2, 'kendaraan_id' => 2, 'kategori_id' => 3, 'jumlah' => 20000, 'keterangan' => 'Parkir'],
            // Trip 3 (berangkat)
            ['tanggal' => now()->subDays(2)->toDateString(), 'trip_id' => 3, 'kendaraan_id' => 1, 'kategori_id' => 1, 'jumlah' => 700000, 'keterangan' => 'Solar'],
            // Maintenance (tanpa trip)
            ['tanggal' => now()->subDays(15)->toDateString(), 'trip_id' => null, 'kendaraan_id' => 1, 'kategori_id' => 5, 'jumlah' => 500000, 'keterangan' => 'Servis 10.000 km'],
            ['tanggal' => now()->subDays(8)->toDateString(), 'trip_id' => null, 'kendaraan_id' => 2, 'kategori_id' => 6, 'jumlah' => 350000, 'keterangan' => 'Ganti oli mesin'],
            // Umum (tanpa trip & kendaraan)
            ['tanggal' => now()->subDays(1)->toDateString(), 'trip_id' => null, 'kendaraan_id' => null, 'kategori_id' => 10, 'jumlah' => 500000, 'keterangan' => 'Listrik bulan ini'],
        ];

        foreach ($biaya as $b) {
            DB::table('biaya_operasional')->insert([
                ...$b,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update trip totals
        $this->recalculateTrips();

        // Update pengembalian untuk trip yang selesai
        DB::table('trips')->where('id', 1)->update([
            'uang_dikembalikan' => 1000000,
            'tanggal_pengembalian' => now()->subDays(9)->toDateString(),
            'selisih_uang' => 0,
        ]);

        DB::table('trips')->where('id', 2)->update([
            'uang_dikembalikan' => 880000,
            'tanggal_pengembalian' => now()->subDays(4)->toDateString(),
            'selisih_uang' => 0,
        ]);
    }

    private function recalculateTrips(): void
    {
        $tripIds = DB::table('trips')->pluck('id');

        foreach ($tripIds as $tripId) {
            $totalBiaya = DB::table('biaya_operasional')
                ->where('trip_id', $tripId)
                ->whereNull('deleted_at')
                ->sum('jumlah');

            $trip = DB::table('trips')->where('id', $tripId)->first();

            if ($trip) {
                DB::table('trips')->where('id', $tripId)->update([
                    'total_biaya' => $totalBiaya,
                    'sisa_uang' => $trip->uang_sangu - $totalBiaya,
                ]);
            }
        }
    }
}