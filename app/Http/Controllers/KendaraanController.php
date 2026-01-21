<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KendaraanController extends Controller
{
    // List all kendaraan
    public function index()
    {
        $kendaraan = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('kendaraan/index', [
            'kendaraan' => $kendaraan
        ]);
    }


    // Store new kendaraan
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_polisi' => 'required|string|max:20|unique:kendaraan,nomor_polisi',
            'jenis' => 'required|string|max:50',
            'merk' => 'nullable|string|max:50',
            'tahun' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'kapasitas_ton' => 'nullable|numeric|min:0',
            'status_aktif' => 'boolean',
            'keterangan' => 'nullable|string',
        ]);

        // Set defaults
        $validated['status_aktif'] = $validated['status_aktif'] ?? true;
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        DB::table('kendaraan')->insert($validated);

        return redirect()->route('kendaraan.index')
            ->with('success', 'Kendaraan berhasil ditambahkan');
    }

    // Update kendaraan
    public function update(Request $request, $id)
    {
        $kendaraan = DB::table('kendaraan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$kendaraan) {
            abort(404);
        }

        $validated = $request->validate([
            'nomor_polisi' => 'required|string|max:20|unique:kendaraan,nomor_polisi,' . $id,
            'jenis' => 'required|string|max:50',
            'merk' => 'nullable|string|max:50',
            'tahun' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'kapasitas_ton' => 'nullable|numeric|min:0',
            'status_aktif' => 'boolean',
            'keterangan' => 'nullable|string',
        ]);

        $validated['updated_at'] = now();

        DB::table('kendaraan')
            ->where('id', $id)
            ->update($validated);

        return redirect()->route('kendaraan.index')
            ->with('success', 'Kendaraan berhasil diupdate');
    }

    // Soft delete kendaraan
    public function destroy($id)
    {
        $kendaraan = DB::table('kendaraan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$kendaraan) {
            abort(404);
        }

        // Check if kendaraan has trips
        $hasTrips = DB::table('trips')
            ->where('kendaraan_id', $id)
            ->whereNull('deleted_at')
            ->exists();

        if ($hasTrips) {
            return redirect()->route('kendaraan.index')
                ->with('error', 'Kendaraan tidak bisa dihapus karena memiliki trip');
        }

        DB::table('kendaraan')
            ->where('id', $id)
            ->update(['deleted_at' => now()]);

        return redirect()->route('kendaraan.index')
            ->with('success', 'Kendaraan berhasil dihapus');
    }
}