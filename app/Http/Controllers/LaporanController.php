<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanController extends Controller
{
    /**
     * Laporan Biaya per Kendaraan
     * Goal: "Per plat dalam periode X habis berapa?"
     */
    public function biayaKendaraan(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());
        $kendaraanId = $request->get('kendaraan_id');

        // Get all kendaraan for filter dropdown
        $kendaraanList = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->orderBy('nomor_polisi')
            ->get();

        $showUmum = $request->get('show_umum', false);

        // Base query for biaya
        $query = DB::table('biaya_operasional')
            ->leftJoin('kendaraan', 'biaya_operasional.kendaraan_id', '=', 'kendaraan.id')
            ->leftJoin('kategori_biaya', 'biaya_operasional.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_operasional.deleted_at')
            ->whereBetween('biaya_operasional.tanggal', [$startDate, $endDate]);

        if ($kendaraanId) {
            // Filter kendaraan spesifik
            $query->where('biaya_operasional.kendaraan_id', $kendaraanId);
        } elseif ($showUmum) {
            // Hanya biaya umum
            $query->whereNull('biaya_operasional.kendaraan_id');
        } else {
            // Default: hanya biaya yang ada kendaraan (exclude umum)
            $query->whereNotNull('biaya_operasional.kendaraan_id');
        }

        // Summary per kendaraan (exclude biaya umum)
        $summaryPerKendaraan = DB::table('biaya_operasional')
            ->leftJoin('kendaraan', 'biaya_operasional.kendaraan_id', '=', 'kendaraan.id')
            ->whereNull('biaya_operasional.deleted_at')
            ->whereBetween('biaya_operasional.tanggal', [$startDate, $endDate])
            ->whereNotNull('biaya_operasional.kendaraan_id')
            ->when($kendaraanId, fn($q) => $q->where('biaya_operasional.kendaraan_id', $kendaraanId))
            ->select(
                'kendaraan.id as kendaraan_id',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis',
                DB::raw('SUM(biaya_operasional.jumlah) as total_biaya'),
                DB::raw('COUNT(biaya_operasional.id) as jumlah_transaksi')
            )
            ->groupBy('kendaraan.id', 'kendaraan.nomor_polisi', 'kendaraan.jenis')
            ->orderBy('total_biaya', 'desc')
            ->get();

        // Summary per kategori - sesuaikan dengan filter
        $summaryPerKategoriQuery = DB::table('biaya_operasional')
            ->leftJoin('kategori_biaya', 'biaya_operasional.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_operasional.deleted_at')
            ->whereBetween('biaya_operasional.tanggal', [$startDate, $endDate]);

        if ($kendaraanId) {
            $summaryPerKategoriQuery->where('biaya_operasional.kendaraan_id', $kendaraanId);
        } elseif ($showUmum) {
            $summaryPerKategoriQuery->whereNull('biaya_operasional.kendaraan_id');
        } else {
            $summaryPerKategoriQuery->whereNotNull('biaya_operasional.kendaraan_id');
        }

        $summaryPerKategori = $summaryPerKategoriQuery
            ->select(
                'kategori_biaya.nama',
                'kategori_biaya.tipe',
                DB::raw('SUM(biaya_operasional.jumlah) as total')
            )
            ->groupBy('kategori_biaya.id', 'kategori_biaya.nama', 'kategori_biaya.tipe')
            ->orderBy('total', 'desc')
            ->get();

        // Summary per tipe - sesuaikan dengan filter
        $summaryPerTipeQuery = DB::table('biaya_operasional')
            ->leftJoin('kategori_biaya', 'biaya_operasional.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_operasional.deleted_at')
            ->whereBetween('biaya_operasional.tanggal', [$startDate, $endDate]);

        if ($kendaraanId) {
            $summaryPerTipeQuery->where('biaya_operasional.kendaraan_id', $kendaraanId);
        } elseif ($showUmum) {
            $summaryPerTipeQuery->whereNull('biaya_operasional.kendaraan_id');
        } else {
            $summaryPerTipeQuery->whereNotNull('biaya_operasional.kendaraan_id');
        }

        $summaryPerTipe = $summaryPerTipeQuery
            ->select(
                'kategori_biaya.tipe',
                DB::raw('SUM(biaya_operasional.jumlah) as total')
            )
            ->groupBy('kategori_biaya.tipe')
            ->get()
            ->keyBy('tipe');

        // Detail transaksi
        $detail = $query->select(
                'biaya_operasional.*',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan',
                'kategori_biaya.nama as nama_kategori',
                'kategori_biaya.tipe as tipe_kategori'
            )
            ->orderBy('biaya_operasional.tanggal', 'desc')
            ->get();

        // Grand total
        $grandTotal = $detail->sum('jumlah');

        // Biaya umum (tanpa kendaraan)
        $biayaUmum = DB::table('biaya_operasional')
            ->leftJoin('kategori_biaya', 'biaya_operasional.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_operasional.deleted_at')
            ->whereNull('biaya_operasional.kendaraan_id')
            ->whereBetween('biaya_operasional.tanggal', [$startDate, $endDate])
            ->sum('biaya_operasional.jumlah');

        return Inertia::render('laporan/biaya-kendaraan', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'kendaraan_id' => $kendaraanId,
                'show_umum' => $showUmum,
            ],
            'kendaraanList' => $kendaraanList,
            'summaryPerKendaraan' => $summaryPerKendaraan,
            'summaryPerKategori' => $summaryPerKategori,
            'summaryPerTipe' => $summaryPerTipe,
            'detail' => $detail,
            'grandTotal' => $grandTotal,
            'biayaUmum' => $biayaUmum,
        ]);
    }

    /**
     * Laporan Rekap Uang Sangu
     */
    public function uangSangu(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());
        $status = $request->get('status'); // belum_selesai, selesai
        $kendaraanId = $request->get('kendaraan_id');

        // Get all kendaraan for filter dropdown
        $kendaraanList = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->orderBy('nomor_polisi')
            ->get();

        // Query trips
        $query = DB::table('trips')
            ->leftJoin('kendaraan', 'trips.kendaraan_id', '=', 'kendaraan.id')
            ->whereNull('trips.deleted_at')
            ->whereBetween('trips.tanggal_trip', [$startDate, $endDate]);

        if ($status) {
            $query->where('trips.status_uang_sangu', $status);
        }

        if ($kendaraanId) {
            $query->where('trips.kendaraan_id', $kendaraanId);
        }

        $trips = $query->select(
                'trips.*',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan'
            )
            ->orderBy('trips.tanggal_trip', 'desc')
            ->get();

        // Summary
        $summary = [
            'total_trip' => $trips->count(),
            'total_uang_sangu' => $trips->sum('uang_sangu'),
            'total_biaya' => $trips->sum('total_biaya'),
            'total_sisa' => $trips->sum('sisa_uang'),
            'total_dikembalikan' => $trips->sum('uang_dikembalikan'),
            'total_selisih' => $trips->sum('selisih_uang'),
            'trip_belum_selesai' => $trips->where('status_uang_sangu', 'belum_selesai')->count(),
            'trip_selesai' => $trips->where('status_uang_sangu', 'selesai')->count(),
        ];

        // Summary per kendaraan
        $summaryPerKendaraan = $trips->groupBy('kendaraan_id')->map(function ($items, $kendaraanId) {
            $first = $items->first();
            return [
                'kendaraan_id' => $kendaraanId,
                'nomor_polisi' => $first->nomor_polisi,
                'jenis' => $first->jenis_kendaraan,
                'total_trip' => $items->count(),
                'total_uang_sangu' => $items->sum('uang_sangu'),
                'total_biaya' => $items->sum('total_biaya'),
                'total_sisa' => $items->sum('sisa_uang'),
            ];
        })->values();

        return Inertia::render('laporan/uang-sangu', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'kendaraan_id' => $kendaraanId,
            ],
            'kendaraanList' => $kendaraanList,
            'trips' => $trips,
            'summary' => $summary,
            'summaryPerKendaraan' => $summaryPerKendaraan,
        ]);
    }
}