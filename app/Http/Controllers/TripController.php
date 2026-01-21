<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = DB::table('trips')
            ->leftJoin('kendaraan', 'trips.kendaraan_id', '=', 'kendaraan.id')
            ->whereNull('trips.deleted_at')
            ->select(
                'trips.*',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan'
            );

        if ($startDate) {
            $query->where('trips.tanggal_trip', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('trips.tanggal_trip', '<=', $endDate);
        }

        $trips = $query
            ->orderBy('trips.tanggal_trip', 'desc')
            ->orderBy('trips.id', 'desc')
            ->get();

        $kendaraan = DB::table('kendaraan')
            ->whereNull('deleted_at')
            ->where('status_aktif', true)
            ->orderBy('nomor_polisi')
            ->get();

        return Inertia::render('trip/index', [
            'trips' => $trips,
            'kendaraan' => $kendaraan,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal_trip' => 'required|date',
            'kendaraan_id' => 'required|exists:kendaraan,id',
            'uang_sangu' => 'required|numeric|min:0',
            'catatan_trip' => 'nullable|string',
        ]);

        DB::table('trips')->insert([
            'tanggal_trip' => $validated['tanggal_trip'],
            'kendaraan_id' => $validated['kendaraan_id'],
            'uang_sangu' => $validated['uang_sangu'],
            'total_biaya' => 0,
            'sisa_uang' => $validated['uang_sangu'],
            'status' => 'draft',
            'status_uang_sangu' => 'belum_selesai',
            'catatan_trip' => $validated['catatan_trip'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('trip.index')
            ->with('success', 'Trip berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $trip = DB::table('trips')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$trip) {
            return redirect()->route('trip.index')
                ->with('error', 'Trip tidak ditemukan');
        }

        // Only allow edit if status is draft
        if ($trip->status !== 'draft') {
            return redirect()->route('trip.index')
                ->with('error', 'Trip yang sudah berangkat tidak dapat diedit');
        }

        $validated = $request->validate([
            'tanggal_trip' => 'required|date',
            'kendaraan_id' => 'required|exists:kendaraan,id',
            'uang_sangu' => 'required|numeric|min:0',
            'catatan_trip' => 'nullable|string',
        ]);

        DB::table('trips')
            ->where('id', $id)
            ->update([
                'tanggal_trip' => $validated['tanggal_trip'],
                'kendaraan_id' => $validated['kendaraan_id'],
                'uang_sangu' => $validated['uang_sangu'],
                'sisa_uang' => $validated['uang_sangu'] - $trip->total_biaya,
                'catatan_trip' => $validated['catatan_trip'] ?? null,
                'updated_at' => now(),
            ]);

        return redirect()->route('trip.index')
            ->with('success', 'Trip berhasil diupdate');
    }

    public function destroy($id)
    {
        $trip = DB::table('trips')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$trip) {
            return redirect()->route('trip.index')
                ->with('error', 'Trip tidak ditemukan');
        }

        // Soft delete
        DB::table('trips')
            ->where('id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        return redirect()->route('trip.index')
            ->with('success', 'Trip berhasil dihapus');
    }

    // Update status trip
    public function updateStatus(Request $request, $id)
    {
        $trip = DB::table('trips')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$trip) {
            return redirect()->route('trip.index')
                ->with('error', 'Trip tidak ditemukan');
        }

        $validated = $request->validate([
            'status' => 'required|in:draft,berangkat,selesai,batal',
        ]);

        $newStatus = $validated['status'];

        // Validate status transition
        $allowedTransitions = [
            'draft' => ['berangkat', 'batal'],
            'berangkat' => ['selesai', 'batal'],
            'selesai' => [],
            'batal' => [],
        ];

        if (!in_array($newStatus, $allowedTransitions[$trip->status])) {
            return redirect()->route('trip.index')
                ->with('error', 'Perubahan status tidak valid');
        }

        DB::table('trips')
            ->where('id', $id)
            ->update([
                'status' => $newStatus,
                'updated_at' => now(),
            ]);

        return redirect()->route('trip.index')
            ->with('success', 'Status trip berhasil diupdate');
    }

    // Konfirmasi pengembalian uang sangu
    public function konfirmasiPengembalian(Request $request, $id)
    {
        $trip = DB::table('trips')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$trip) {
            return redirect()->route('trip.index')
                ->with('error', 'Trip tidak ditemukan');
        }

        if ($trip->status_uang_sangu === 'selesai') {
            return redirect()->route('trip.index')
                ->with('error', 'Uang sangu sudah dikonfirmasi sebelumnya');
        }

        $validated = $request->validate([
            'uang_dikembalikan' => 'required|numeric|min:0',
            'tanggal_pengembalian' => 'required|date',
            'catatan_pengembalian' => 'nullable|string',
        ]);

        $selisih = $validated['uang_dikembalikan'] - $trip->sisa_uang;

        DB::table('trips')
            ->where('id', $id)
            ->update([
                'uang_dikembalikan' => $validated['uang_dikembalikan'],
                'tanggal_pengembalian' => $validated['tanggal_pengembalian'],
                'selisih_uang' => $selisih,
                'catatan_pengembalian' => $validated['catatan_pengembalian'] ?? null,
                'status_uang_sangu' => 'selesai',
                'updated_at' => now(),
            ]);

        return redirect()->route('trip.index')
            ->with('success', 'Pengembalian uang sangu berhasil dikonfirmasi');
    }
}