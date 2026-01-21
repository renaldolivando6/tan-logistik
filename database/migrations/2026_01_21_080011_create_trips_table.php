<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal_trip');
            $table->foreignId('kendaraan_id')->constrained('kendaraan')->onDelete('cascade');
            $table->decimal('uang_sangu', 15, 2)->default(0);
            $table->decimal('total_biaya', 15, 2)->default(0); // auto calculated
            $table->decimal('sisa_uang', 15, 2)->default(0); // uang_sangu - total_biaya
            $table->enum('status', ['draft', 'berangkat', 'selesai', 'batal'])->default('draft');
            // draft: baru dibuat, masih bisa edit
            // berangkat: sudah jalan, tidak bisa edit
            // selesai: trip selesai
            // batal: dibatalkan
            $table->enum('status_uang_sangu', ['belum_selesai', 'selesai'])->default('belum_selesai');
            $table->decimal('uang_dikembalikan', 15, 2)->nullable();
            $table->date('tanggal_pengembalian')->nullable();
            $table->decimal('selisih_uang', 15, 2)->nullable(); // uang_dikembalikan - sisa_uang
            $table->text('catatan_trip')->nullable();
            $table->text('catatan_pengembalian')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes untuk performa query
            $table->index('tanggal_trip');
            $table->index('status');
            $table->index('status_uang_sangu');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};