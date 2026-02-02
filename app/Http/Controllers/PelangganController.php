<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PelangganController extends Controller
{
    public function index()
    {
        $pelanggan = DB::table('pelanggan')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('pelanggan/index', [
            'pelanggan' => $pelanggan
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'no_telepon' => 'required|string|max:20|unique:pelanggan,no_telepon',
            'alamat' => 'nullable|string',
            'status_aktif' => 'boolean',
        ]);

        $validated['status_aktif'] = $validated['status_aktif'] ?? true;
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        DB::table('pelanggan')->insert($validated);

        return redirect()->route('pelanggan.index')
            ->with('success', 'Pelanggan berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $pelanggan = DB::table('pelanggan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$pelanggan) {
            abort(404);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'no_telepon' => 'required|string|max:20|unique:pelanggan,no_telepon,' . $id,
            'alamat' => 'nullable|string',
            'status_aktif' => 'boolean',
        ]);

        $validated['updated_at'] = now();

        DB::table('pelanggan')
            ->where('id', $id)
            ->update($validated);

        return redirect()->route('pelanggan.index')
            ->with('success', 'Pelanggan berhasil diupdate');
    }

    public function destroy($id)
    {
        $pelanggan = DB::table('pelanggan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$pelanggan) {
            abort(404);
        }

        // Check if pelanggan has trips
        $hasTrips = DB::table('trips')
            ->where('pelanggan_id', $id)
            ->whereNull('deleted_at')
            ->exists();

        if ($hasTrips) {
            return redirect()->route('pelanggan.index')
                ->with('error', 'Pelanggan tidak bisa dihapus karena memiliki trip');
        }

        DB::table('pelanggan')
            ->where('id', $id)
            ->update(['deleted_at' => now()]);

        return redirect()->route('pelanggan.index')
            ->with('success', 'Pelanggan berhasil dihapus');
    }
}