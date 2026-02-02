<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            // Tambah kolom nullable dulu
            $table->unsignedBigInteger('pelanggan_id')
                  ->nullable()
                  ->after('kendaraan_id');
            
            $table->index(['pelanggan_id', 'tanggal_trip']);
        });
        
        // Setelah ini, nanti manual update trips yang sudah ada untuk assign pelanggan
        // Atau bisa buat pelanggan dummy dulu, lalu update semua trips
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropIndex(['pelanggan_id', 'tanggal_trip']);
            $table->dropColumn('pelanggan_id');
        });
    }
};