<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori_biaya', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 50); // SOLAR, TOL, SERVIS, BAN, dll
            $table->enum('tipe', ['trip', 'maintenance', 'umum']);
            // trip: biaya perjalanan (solar, tol, parkir, makan)
            // maintenance: servis, ganti ban, accu, sparepart
            // umum: overhead (listrik, sewa kantor, gaji)
            $table->text('keterangan')->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kategori_biaya');
    }
};