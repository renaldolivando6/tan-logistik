<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop kolom checklist
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['status_surat_jalan', 'tanggal_checklist_surat']);
        });

        // Update enum status: 'berangkat' → 'sedang_jalan'
        DB::statement("ALTER TABLE trips MODIFY status ENUM('draft', 'sedang_jalan', 'selesai', 'batal') NOT NULL DEFAULT 'draft'");
        
        // Update data yang ada: 'berangkat' → 'sedang_jalan'
        DB::table('trips')->where('status', 'berangkat')->update(['status' => 'sedang_jalan']);
    }

    public function down(): void
    {
        // Kembalikan enum status
        DB::statement("ALTER TABLE trips MODIFY status ENUM('draft', 'berangkat', 'selesai', 'batal') NOT NULL DEFAULT 'draft'");
        
        // Update data kembali
        DB::table('trips')->where('status', 'sedang_jalan')->update(['status' => 'berangkat']);
        
        // Tambah kembali kolom checklist
        Schema::table('trips', function (Blueprint $table) {
            $table->enum('status_surat_jalan', ['belum_checklist', 'sudah_checklist'])->default('belum_checklist')->after('status');
            $table->timestamp('tanggal_checklist_surat')->nullable()->after('status_surat_jalan');
        });
    }
};