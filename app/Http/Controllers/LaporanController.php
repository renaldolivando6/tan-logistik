<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanController extends Controller
{
    /**
     * Laporan Biaya Maintenance per Kendaraan
     */
    public function biayaKendaraan(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());
        $kendaraanId = $request->get('kendaraan_id');
        $showUmum = $request->get('show_umum', false);

        // Get all kendaraan for filter dropdown
        $kendaraanList = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->orderBy('nomor_polisi')
            ->get();

        // Base query for biaya maintenance
        $query = DB::table('biaya_maintenance')
            ->leftJoin('kendaraan', 'biaya_maintenance.kendaraan_id', '=', 'kendaraan.id')
            ->leftJoin('kategori_biaya', 'biaya_maintenance.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_maintenance.deleted_at')
            ->whereBetween('biaya_maintenance.tanggal', [$startDate, $endDate]);

        if ($kendaraanId) {
            $query->where('biaya_maintenance.kendaraan_id', $kendaraanId);
        } elseif ($showUmum) {
            $query->whereNull('biaya_maintenance.kendaraan_id');
        } else {
            $query->whereNotNull('biaya_maintenance.kendaraan_id');
        }

        // Summary per kendaraan
        $summaryPerKendaraan = DB::table('biaya_maintenance')
            ->leftJoin('kendaraan', 'biaya_maintenance.kendaraan_id', '=', 'kendaraan.id')
            ->whereNull('biaya_maintenance.deleted_at')
            ->whereBetween('biaya_maintenance.tanggal', [$startDate, $endDate])
            ->whereNotNull('biaya_maintenance.kendaraan_id')
            ->when($kendaraanId, fn($q) => $q->where('biaya_maintenance.kendaraan_id', $kendaraanId))
            ->select(
                'kendaraan.id as kendaraan_id',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis',
                DB::raw('SUM(biaya_maintenance.jumlah) as total_biaya'),
                DB::raw('COUNT(biaya_maintenance.id) as jumlah_transaksi')
            )
            ->groupBy('kendaraan.id', 'kendaraan.nomor_polisi', 'kendaraan.jenis')
            ->orderBy('total_biaya', 'desc')
            ->get();

        // Summary per kategori
        $summaryPerKategoriQuery = DB::table('biaya_maintenance')
            ->leftJoin('kategori_biaya', 'biaya_maintenance.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_maintenance.deleted_at')
            ->whereBetween('biaya_maintenance.tanggal', [$startDate, $endDate]);

        if ($kendaraanId) {
            $summaryPerKategoriQuery->where('biaya_maintenance.kendaraan_id', $kendaraanId);
        } elseif ($showUmum) {
            $summaryPerKategoriQuery->whereNull('biaya_maintenance.kendaraan_id');
        } else {
            $summaryPerKategoriQuery->whereNotNull('biaya_maintenance.kendaraan_id');
        }

        $summaryPerKategori = $summaryPerKategoriQuery
            ->select(
                'kategori_biaya.nama',
                'kategori_biaya.tipe',
                DB::raw('SUM(biaya_maintenance.jumlah) as total')
            )
            ->groupBy('kategori_biaya.id', 'kategori_biaya.nama', 'kategori_biaya.tipe')
            ->orderBy('total', 'desc')
            ->get();

        // Summary per tipe
        $summaryPerTipeQuery = DB::table('biaya_maintenance')
            ->leftJoin('kategori_biaya', 'biaya_maintenance.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_maintenance.deleted_at')
            ->whereBetween('biaya_maintenance.tanggal', [$startDate, $endDate]);

        if ($kendaraanId) {
            $summaryPerTipeQuery->where('biaya_maintenance.kendaraan_id', $kendaraanId);
        } elseif ($showUmum) {
            $summaryPerTipeQuery->whereNull('biaya_maintenance.kendaraan_id');
        } else {
            $summaryPerTipeQuery->whereNotNull('biaya_maintenance.kendaraan_id');
        }

        $summaryPerTipe = $summaryPerTipeQuery
            ->select(
                'kategori_biaya.tipe',
                DB::raw('SUM(biaya_maintenance.jumlah) as total')
            )
            ->groupBy('kategori_biaya.tipe')
            ->get()
            ->keyBy('tipe');

        // Detail transaksi
        $detail = $query->select(
                'biaya_maintenance.*',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan',
                'kategori_biaya.nama as nama_kategori',
                'kategori_biaya.tipe as tipe_kategori'
            )
            ->orderBy('biaya_maintenance.tanggal', 'desc')
            ->get();

        // Grand total
        $grandTotal = $detail->sum('jumlah');

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
        ]);
    }

    /**
     * Laporan Rekap Uang Sangu Trip
     */
    public function uangSangu(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());
        $status = $request->get('status');
        $kendaraanId = $request->get('kendaraan_id');

        // Get all kendaraan for filter dropdown
        $kendaraanList = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->orderBy('nomor_polisi')
            ->get();

        // Query trips
        $query = DB::table('trips')
            ->leftJoin('kendaraan', 'trips.kendaraan_id', '=', 'kendaraan.id')
            ->leftJoin('lokasi as asal', 'trips.asal_id', '=', 'asal.id')
            ->leftJoin('lokasi as tujuan', 'trips.tujuan_id', '=', 'tujuan.id')
            ->whereNull('trips.deleted_at')
            ->whereBetween('trips.tanggal_trip', [$startDate, $endDate]);

        if ($status) {
            $query->where('trips.status', $status);
        }

        if ($kendaraanId) {
            $query->where('trips.kendaraan_id', $kendaraanId);
        }

        $trips = $query->select(
                'trips.*',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan',
                'asal.nama_kota as nama_asal',
                'tujuan.nama_kota as nama_tujuan'
            )
            ->orderBy('trips.tanggal_trip', 'desc')
            ->get();

        // Summary
        $summary = [
            'total_trip' => $trips->count(),
            'total_uang_sangu' => $trips->sum('uang_sangu'),
            'trip_draft' => $trips->where('status', 'draft')->count(),
            'trip_sedang_jalan' => $trips->where('status', 'sedang_jalan')->count(),
            'trip_selesai' => $trips->where('status', 'selesai')->count(),
            'trip_batal' => $trips->where('status', 'batal')->count(),
        ];

        // Summary per kendaraan
        $summaryPerKendaraan = $trips->groupBy('kendaraan_id')->map(function ($items) {
            $first = $items->first();
            return [
                'kendaraan_id' => $first->kendaraan_id,
                'nomor_polisi' => $first->nomor_polisi,
                'jenis' => $first->jenis_kendaraan,
                'total_trip' => $items->count(),
                'total_uang_sangu' => $items->sum('uang_sangu'),
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