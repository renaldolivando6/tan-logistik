<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biaya_operasional', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('trip_id')->nullable()->constrained('trips')->onDelete('cascade');
            $table->foreignId('kendaraan_id')->nullable()->constrained('kendaraan')->onDelete('cascade');
            // NULL jika biaya umum (tidak terkait kendaraan)
            $table->foreignId('kategori_id')->constrained('kategori_biaya')->onDelete('restrict');
            $table->decimal('jumlah', 15, 2);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes untuk performa query
            $table->index('tanggal');
            $table->index(['kendaraan_id', 'tanggal']);
            $table->index('trip_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biaya_operasional');
    }
};