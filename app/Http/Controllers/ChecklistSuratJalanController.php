<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChecklistSuratJalanController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $status = $request->get('status');

        $query = DB::table('checklist_surat_jalan')
            ->whereNull('deleted_at');

        if ($startDate) {
            $query->where('tanggal_surat', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('tanggal_surat', '<=', $endDate);
        }
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $checklist = $query
            ->orderBy('tanggal_surat', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('checklist-surat-jalan/index', [
            'checklist' => $checklist,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_surat_jalan' => 'required|string|max:255',
            'tanggal_surat' => 'required|date',
            'catatan' => 'nullable|string',
        ]);

        DB::table('checklist_surat_jalan')->insert([
            'nomor_surat_jalan' => $validated['nomor_surat_jalan'],
            'tanggal_surat' => $validated['tanggal_surat'],
            'status' => 'belum_selesai',
            'catatan' => $validated['catatan'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('checklist-surat-jalan.index')
            ->with('success', 'Surat jalan berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $checklist = DB::table('checklist_surat_jalan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$checklist) {
            return redirect()->route('checklist-surat-jalan.index')
                ->with('error', 'Surat jalan tidak ditemukan');
        }

        $validated = $request->validate([
            'nomor_surat_jalan' => 'required|string|max:255',
            'tanggal_surat' => 'required|date',
            'catatan' => 'nullable|string',
        ]);

        DB::table('checklist_surat_jalan')
            ->where('id', $id)
            ->update([
                'nomor_surat_jalan' => $validated['nomor_surat_jalan'],
                'tanggal_surat' => $validated['tanggal_surat'],
                'catatan' => $validated['catatan'] ?? null,
                'updated_at' => now(),
            ]);

        return redirect()->route('checklist-surat-jalan.index')
            ->with('success', 'Surat jalan berhasil diupdate');
    }

    public function destroy($id)
    {
        $checklist = DB::table('checklist_surat_jalan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$checklist) {
            return redirect()->route('checklist-surat-jalan.index')
                ->with('error', 'Surat jalan tidak ditemukan');
        }

        // Soft delete
        DB::table('checklist_surat_jalan')
            ->where('id', $id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        return redirect()->route('checklist-surat-jalan.index')
            ->with('success', 'Surat jalan berhasil dihapus');
    }

    public function toggleChecklist(Request $request, $id)
    {
        $checklist = DB::table('checklist_surat_jalan')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$checklist) {
            return redirect()->route('checklist-surat-jalan.index')
                ->with('error', 'Surat jalan tidak ditemukan');
        }

        $newStatus = $checklist->status === 'belum_selesai' ? 'selesai' : 'belum_selesai';
        $tanggalChecklist = $newStatus === 'selesai' ? now() : null;

        DB::table('checklist_surat_jalan')
            ->where('id', $id)
            ->update([
                'status' => $newStatus,
                'tanggal_checklist' => $tanggalChecklist,
                'updated_at' => now(),
            ]);

        return redirect()->route('checklist-surat-jalan.index')
            ->with('success', 'Status checklist berhasil diupdate');
    }
}