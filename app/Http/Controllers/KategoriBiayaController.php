<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KategoriBiayaController extends Controller
{
    public function index()
    {
        $kategoriBiaya = DB::table('kategori_biaya')
            ->whereNull('deleted_at')
            ->orderBy('tipe')
            ->orderBy('nama')
            ->get();

        return Inertia::render('kategori-biaya/index', [
            'kategoriBiaya' => $kategoriBiaya,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:50',
            'tipe' => 'required|in:trip,maintenance,umum',
            'keterangan' => 'nullable|string',
            'status_aktif' => 'boolean',
        ]);

        DB::table('kategori_biaya')->insert([
            'nama' => $validated['nama'],
            'tipe' => $validated['tipe'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status_aktif' => $validated['status_aktif'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('kategori-biaya.index')
            ->with('success', 'Kategori biaya berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:50',
            'tipe' => 'required|in:trip,maintenance,umum',
            'keterangan' => 'nullable|string',
            'status_aktif' => 'boolean',
        ]);

        $exists = DB::table('kategori_biaya')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->exists();

        if (!$exists) {
            return redirect()->route('kategori-biaya.index')
                ->with('error', 'Kategori biaya tidak ditemukan');
        }

        DB::table('kategori_biaya')
            ->where('id', $id)
            ->update([
                'nama' => $validated['nama'],
                'tipe' => $validated['tipe'],
                'keterangan' => $validated['keterangan'] ?? null,
                'status_aktif' => $validated['status_aktif'] ?? true,
                'updated_at' => now(),
            ]);

        return redirect()->route('kategori-biaya.index')
            ->with('success', 'Kategori biaya berhasil diupdate');
    }

    public function destroy($id)
    {
        $exists = DB::table('kategori_biaya')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->exists();

        if (!$exists) {
            return redirect()->route('kategori-biaya.index')
                ->with('error', 'Kategori biaya tidak ditemukan');
        }

        // Soft delete
        DB::table('kategori_biaya')
            ->where('id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        return redirect()->route('kategori-biaya.index')
            ->with('success', 'Kategori biaya berhasil dihapus');
    }
}