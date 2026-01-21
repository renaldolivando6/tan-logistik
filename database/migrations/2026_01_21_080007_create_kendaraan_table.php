<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kendaraan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_polisi', 20)->unique();
            $table->string('jenis', 50); // Truk, Pickup, Box, dll
            $table->string('merk', 50)->nullable(); // Mitsubishi, Hino, Isuzu
            $table->year('tahun')->nullable();
            $table->decimal('kapasitas_ton', 8, 2)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kendaraan');
    }
};