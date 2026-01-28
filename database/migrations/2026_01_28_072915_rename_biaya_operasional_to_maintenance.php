<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign key constraint dulu
        Schema::table('biaya_operasional', function (Blueprint $table) {
            $table->dropForeign('biaya_operasional_trip_id_foreign');
        });

        // Drop kolom trip_id
        Schema::table('biaya_operasional', function (Blueprint $table) {
            $table->dropColumn('trip_id');
        });

        // Rename table
        Schema::rename('biaya_operasional', 'biaya_maintenance');
    }

    public function down(): void
    {
        // Rename back
        Schema::rename('biaya_maintenance', 'biaya_operasional');

        // Tambah kembali kolom trip_id
        Schema::table('biaya_operasional', function (Blueprint $table) {
            $table->foreignId('trip_id')->nullable()->after('tanggal')->constrained('trips')->onDelete('cascade');
        });
    }
};