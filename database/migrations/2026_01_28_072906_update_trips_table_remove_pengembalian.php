<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            // Drop columns yang tidak dipakai
            $table->dropColumn([
                'total_biaya',
                'sisa_uang',
                'status_uang_sangu',
                'uang_dikembalikan',
                'tanggal_pengembalian',
                'selisih_uang',
                'catatan_pengembalian'
            ]);

            // Tambah kolom untuk checklist surat jalan
            $table->enum('status_surat_jalan', ['belum_checklist', 'sudah_checklist'])
                ->default('belum_checklist')
                ->after('status');
            $table->timestamp('tanggal_checklist_surat')->nullable()->after('status_surat_jalan');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            // Rollback: kembalikan struktur lama
            $table->decimal('total_biaya', 15, 2)->default(0)->after('uang_sangu');
            $table->decimal('sisa_uang', 15, 2)->default(0)->after('total_biaya');
            $table->enum('status_uang_sangu', ['belum_selesai', 'selesai'])->default('belum_selesai')->after('status');
            $table->decimal('uang_dikembalikan', 15, 2)->nullable()->after('status_uang_sangu');
            $table->date('tanggal_pengembalian')->nullable()->after('uang_dikembalikan');
            $table->decimal('selisih_uang', 15, 2)->nullable()->after('tanggal_pengembalian');
            $table->text('catatan_pengembalian')->nullable()->after('catatan_trip');

            // Drop kolom baru
            $table->dropColumn(['status_surat_jalan', 'tanggal_checklist_surat']);
        });
    }
};