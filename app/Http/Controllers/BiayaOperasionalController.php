<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BiayaOperasionalController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = DB::table('biaya_operasional')
            ->leftJoin('trips', 'biaya_operasional.trip_id', '=', 'trips.id')
            ->leftJoin('kendaraan', 'biaya_operasional.kendaraan_id', '=', 'kendaraan.id')
            ->leftJoin('kategori_biaya', 'biaya_operasional.kategori_id', '=', 'kategori_biaya.id')
            ->whereNull('biaya_operasional.deleted_at')
            ->select(
                'biaya_operasional.*',
                'trips.tanggal_trip',
                'kendaraan.nomor_polisi',
                'kendaraan.jenis as jenis_kendaraan',
                'kategori_biaya.nama as nama_kategori',
                'kategori_biaya.tipe as tipe_kategori'
            );

        if ($startDate) {
            $query->where('biaya_operasional.tanggal', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('biaya_operasional.tanggal', '<=', $endDate);
        }

        $biayaOperasional = $query
            ->orderBy('biaya_operasional.tanggal', 'desc')
            ->orderBy('biaya_operasional.id', 'desc')
            ->get();

        // Get active trips (draft atau berangkat) untuk dropdown
        $trips = DB::table('trips')
            ->leftJoin('kendaraan', 'trips.kendaraan_id', '=', 'kendaraan.id')
            ->whereNull('trips.deleted_at')
            ->whereIn('trips.status', ['draft', 'berangkat'])
            ->select(
                'trips.id',
                'trips.tanggal_trip',
                'trips.kendaraan_id',
                'trips.uang_sangu',
                'kendaraan.nomor_polisi'
            )
            ->orderBy('trips.tanggal_trip', 'desc')
            ->orderBy('trips.id', 'desc')
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

        return Inertia::render('biaya-operasional/index', [
            'biayaOperasional' => $biayaOperasional,
            'trips' => $trips,
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
            if ($kategori->tipe === 'trip') {
                $rules['trip_id'] = 'required|exists:trips,id';
                $rules['kendaraan_id'] = 'nullable';
            } elseif ($kategori->tipe === 'maintenance') {
                $rules['trip_id'] = 'nullable';
                $rules['kendaraan_id'] = 'required|exists:kendaraan,id';
            } else {
                // umum - tidak perlu keduanya
                $rules['trip_id'] = 'nullable';
                $rules['kendaraan_id'] = 'nullable';
            }
        }

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            // Get kendaraan_id from trip if trip selected
            $kendaraanId = $validated['kendaraan_id'] ?? null;
            if ($validated['trip_id'] ?? null) {
                $trip = DB::table('trips')->where('id', $validated['trip_id'])->first();
                if ($trip) {
                    $kendaraanId = $trip->kendaraan_id;
                }
            }

            // Insert biaya operasional
            DB::table('biaya_operasional')->insert([
                'tanggal' => $validated['tanggal'],
                'trip_id' => $validated['trip_id'] ?? null,
                'kendaraan_id' => $kendaraanId,
                'kategori_id' => $validated['kategori_id'],
                'jumlah' => $validated['jumlah'],
                'keterangan' => $validated['keterangan'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update total_biaya dan sisa_uang di trip jika ada trip_id
            if ($validated['trip_id']) {
                $this->recalculateTripBiaya($validated['trip_id']);
            }

            DB::commit();

            return redirect()->route('biaya-operasional.index')
                ->with('success', 'Biaya operasional berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('biaya-operasional.index')
                ->with('error', 'Gagal menambahkan biaya operasional');
        }
    }

    public function update(Request $request, $id)
    {
        $biaya = DB::table('biaya_operasional')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$biaya) {
            return redirect()->route('biaya-operasional.index')
                ->with('error', 'Biaya operasional tidak ditemukan');
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
            if ($kategori->tipe === 'trip') {
                $rules['trip_id'] = 'required|exists:trips,id';
                $rules['kendaraan_id'] = 'nullable';
            } elseif ($kategori->tipe === 'maintenance') {
                $rules['trip_id'] = 'nullable';
                $rules['kendaraan_id'] = 'required|exists:kendaraan,id';
            } else {
                $rules['trip_id'] = 'nullable';
                $rules['kendaraan_id'] = 'nullable';
            }
        }

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $oldTripId = $biaya->trip_id;
            $newTripId = $validated['trip_id'] ?? null;

            // Get kendaraan_id from trip if trip selected
            $kendaraanId = $validated['kendaraan_id'] ?? null;
            if ($newTripId) {
                $trip = DB::table('trips')->where('id', $newTripId)->first();
                if ($trip) {
                    $kendaraanId = $trip->kendaraan_id;
                }
            }

            // Update biaya operasional
            DB::table('biaya_operasional')
                ->where('id', $id)
                ->update([
                    'tanggal' => $validated['tanggal'],
                    'trip_id' => $newTripId,
                    'kendaraan_id' => $kendaraanId,
                    'kategori_id' => $validated['kategori_id'],
                    'jumlah' => $validated['jumlah'],
                    'keterangan' => $validated['keterangan'] ?? null,
                    'updated_at' => now(),
                ]);

            // Recalculate old trip if changed
            if ($oldTripId && $oldTripId != $newTripId) {
                $this->recalculateTripBiaya($oldTripId);
            }

            // Recalculate new trip
            if ($newTripId) {
                $this->recalculateTripBiaya($newTripId);
            }

            DB::commit();

            return redirect()->route('biaya-operasional.index')
                ->with('success', 'Biaya operasional berhasil diupdate');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('biaya-operasional.index')
                ->with('error', 'Gagal mengupdate biaya operasional');
        }
    }

    public function destroy($id)
    {
        $biaya = DB::table('biaya_operasional')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$biaya) {
            return redirect()->route('biaya-operasional.index')
                ->with('error', 'Biaya operasional tidak ditemukan');
        }

        DB::beginTransaction();
        try {
            $tripId = $biaya->trip_id;

            // Soft delete
            DB::table('biaya_operasional')
                ->where('id', $id)
                ->update([
                    'deleted_at' => now(),
                    'updated_at' => now(),
                ]);

            // Recalculate trip if exists
            if ($tripId) {
                $this->recalculateTripBiaya($tripId);
            }

            DB::commit();

            return redirect()->route('biaya-operasional.index')
                ->with('success', 'Biaya operasional berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('biaya-operasional.index')
                ->with('error', 'Gagal menghapus biaya operasional');
        }
    }

    /**
     * Recalculate total_biaya dan sisa_uang untuk trip
     */
    private function recalculateTripBiaya($tripId)
    {
        $totalBiaya = DB::table('biaya_operasional')
            ->where('trip_id', $tripId)
            ->whereNull('deleted_at')
            ->sum('jumlah');

        $trip = DB::table('trips')->where('id', $tripId)->first();

        if ($trip) {
            $sisaUang = $trip->uang_sangu - $totalBiaya;

            DB::table('trips')
                ->where('id', $tripId)
                ->update([
                    'total_biaya' => $totalBiaya,
                    'sisa_uang' => $sisaUang,
                    'updated_at' => now(),
                ]);
        }
    }
}