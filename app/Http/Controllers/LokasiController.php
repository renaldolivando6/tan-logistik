<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LokasiController extends Controller
{
    public function index()
    {
        $lokasi = DB::table('lokasi')
            ->whereNull('deleted_at')
            ->orderBy('nama_kota')
            ->get();

        return Inertia::render('lokasi/index', [
            'lokasi' => $lokasi,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kota' => 'required|string|max:100',
            'status_aktif' => 'boolean',
        ]);

        DB::table('lokasi')->insert([
            'nama_kota' => $validated['nama_kota'],
            'status_aktif' => $validated['status_aktif'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('lokasi.index')
            ->with('success', 'Lokasi berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $lokasi = DB::table('lokasi')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$lokasi) {
            return redirect()->route('lokasi.index')
                ->with('error', 'Lokasi tidak ditemukan');
        }

        $validated = $request->validate([
            'nama_kota' => 'required|string|max:100',
            'status_aktif' => 'boolean',
        ]);

        DB::table('lokasi')
            ->where('id', $id)
            ->update([
                'nama_kota' => $validated['nama_kota'],
                'status_aktif' => $validated['status_aktif'] ?? true,
                'updated_at' => now(),
            ]);

        return redirect()->route('lokasi.index')
            ->with('success', 'Lokasi berhasil diupdate');
    }

    public function destroy($id)
    {
        $lokasi = DB::table('lokasi')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$lokasi) {
            return redirect()->route('lokasi.index')
                ->with('error', 'Lokasi tidak ditemukan');
        }

        // Check if lokasi is being used in trips
        $usedInTrips = DB::table('trips')
            ->where(function($query) use ($id) {
                $query->where('asal_id', $id)
                      ->orWhere('tujuan_id', $id);
            })
            ->whereNull('deleted_at')
            ->exists();

        if ($usedInTrips) {
            return redirect()->route('lokasi.index')
                ->with('error', 'Lokasi tidak dapat dihapus karena masih digunakan di trip');
        }

        // Soft delete
        DB::table('lokasi')
            ->where('id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        return redirect()->route('lokasi.index')
            ->with('success', 'Lokasi berhasil dihapus');
    }
}