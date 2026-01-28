<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update semua tipe 'trip' jadi 'maintenance'
        DB::table('kategori_biaya')
            ->where('tipe', 'trip')
            ->update(['tipe' => 'maintenance']);

        // Alter enum: hanya 'maintenance' dan 'umum'
        DB::statement("ALTER TABLE kategori_biaya MODIFY tipe ENUM('maintenance', 'umum') NOT NULL");
    }

    public function down(): void
    {
        // Rollback: tambah kembali tipe 'trip'
        DB::statement("ALTER TABLE kategori_biaya MODIFY tipe ENUM('trip', 'maintenance', 'umum') NOT NULL");
    }
};