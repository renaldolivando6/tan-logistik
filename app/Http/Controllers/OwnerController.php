<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OwnerController extends Controller
{
    /**
     * Check if current user is owner (id = 1)
     */
    private function checkOwner()
    {
        if (auth()->id() !== 1) {
            abort(403, 'Unauthorized. Only owner can access this page.');
        }
    }

    /**
     * Show trip status override page
     */
    public function tripStatusOverride()
    {
        $this->checkOwner();

        $trips = DB::table('trips')
            ->leftJoin('kendaraan', 'trips.kendaraan_id', '=', 'kendaraan.id')
            ->leftJoin('lokasi as asal', 'trips.asal_id', '=', 'asal.id')
            ->leftJoin('lokasi as tujuan', 'trips.tujuan_id', '=', 'tujuan.id')
            ->whereNull('trips.deleted_at')
            ->select(
                'trips.id',
                'trips.tanggal_trip',
                'trips.status',
                'kendaraan.nomor_polisi',
                'asal.nama_kota as nama_asal',
                'tujuan.nama_kota as nama_tujuan'
            )
            ->orderBy('trips.tanggal_trip', 'desc')
            ->orderBy('trips.id', 'desc')
            ->get();

        return Inertia::render('owner/index', [
            'trips' => $trips,
        ]);
    }

    /**
     * Update trip status (owner override)
     */
    public function updateTripStatus(Request $request)
    {
        $this->checkOwner();

        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'status' => 'required|in:draft,sedang_jalan,selesai,batal',
        ]);

        DB::table('trips')
            ->where('id', $validated['trip_id'])
            ->update([
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Status trip berhasil diubah');
    }
}