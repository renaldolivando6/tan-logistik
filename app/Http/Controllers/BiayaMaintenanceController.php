<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BiayaMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = DB::table('biaya_maintenance')
            ->leftJoin('kendaraan', 'biaya_maintenance.kendaraan_id', '=', 'kendaraan.id')
            ->leftJoin('kategori_biaya', 'biaya_maintenance.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_maintenance.deleted_at')
            ->select(
                'biaya_maintenance.*',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan',
                'kategori_biaya.nama as nama_kategori',
                'kategori_biaya.tipe as tipe_kategori'
            );

        if ($startDate) {
            $query->where('biaya_maintenance.tanggal', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('biaya_maintenance.tanggal', '<=', $endDate);
        }

        $biayaMaintenance = $query
            ->orderBy('biaya_maintenance.tanggal', 'desc')
            ->orderBy('biaya_maintenance.id', 'desc')
            ->get();

        $kendaraan = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->where('status_aktif', true)
            ->orderBy('nomor_polisi')
            ->get();

        $kategoriBiaya = DB::table('kategori_biaya')
            ->whereNull('deleted_at')
            ->where('status_aktif', true)
            ->orderBy('tipe')
            ->orderBy('nama')
            ->get();

        return Inertia::render('biaya-maintenance/index', [
            'biayaMaintenance' => $biayaMaintenance,
            'kendaraan' => $kendaraan,
            'kategoriBiaya' => $kategoriBiaya,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Get kategori untuk cek tipe
        $kategori = DB::table('kategori_biaya')
            ->where('id', $request->kategori_id)
            ->first();

        $rules = [
            'tanggal' => 'required|date',
            'kategori_id' => 'required|exists:kategori_biaya,id',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ];

        // Conditional validation based on tipe
        if ($kategori) {
            if ($kategori->tipe === 'maintenance') {
                $rules['kendaraan_id'] = 'required|exists:kendaraan,id';
            } else {
                // umum - optional
                $rules['kendaraan_id'] = 'nullable|exists:kendaraan,id';
            }
        }

        $validated = $request->validate($rules);

        DB::table('biaya_maintenance')->insert([
            'tanggal' => $validated['tanggal'],
            'kendaraan_id' => $validated['kendaraan_id'] ?? null,
            'kategori_id' => $validated['kategori_id'],
            'jumlah' => $validated['jumlah'],
            'keterangan' => $validated['keterangan'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('biaya-maintenance.index')
            ->with('success', 'Biaya berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $biaya = DB::table('biaya_maintenance')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$biaya) {
            return redirect()->route('biaya-maintenance.index')
                ->with('error', 'Biaya tidak ditemukan');
        }

        // Get kategori untuk cek tipe
        $kategori = DB::table('kategori_biaya')
            ->where('id', $request->kategori_id)
            ->first();

        $rules = [
            'tanggal' => 'required|date',
            'kategori_id' => 'required|exists:kategori_biaya,id',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ];

        // Conditional validation based on tipe
        if ($kategori) {
            if ($kategori->tipe === 'maintenance') {
                $rules['kendaraan_id'] = 'required|exists:kendaraan,id';
            } else {
                $rules['kendaraan_id'] = 'nullable|exists:kendaraan,id';
            }
        }

        $validated = $request->validate($rules);

        DB::table('biaya_maintenance')
            ->where('id', $id)
            ->update([
                'tanggal' => $validated['tanggal'],
                'kendaraan_id' => $validated['kendaraan_id'] ?? null,
                'kategori_id' => $validated['kategori_id'],
                'jumlah' => $validated['jumlah'],
                'keterangan' => $validated['keterangan'] ?? null,
                'updated_at' => now(),
            ]);

        return redirect()->route('biaya-maintenance.index')
            ->with('success', 'Biaya berhasil diupdate');
    }

    public function destroy($id)
    {
        $biaya = DB::table('biaya_maintenance')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$biaya) {
            return redirect()->route('biaya-maintenance.index')
                ->with('error', 'Biaya tidak ditemukan');
        }

        // Soft delete
        DB::table('biaya_maintenance')
            ->where('id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        return redirect()->route('biaya-maintenance.index')
            ->with('success', 'Biaya berhasil dihapus');
    }
}