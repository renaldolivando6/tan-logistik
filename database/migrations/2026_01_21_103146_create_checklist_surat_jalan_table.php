<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('checklist_surat_jalan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat_jalan');
            $table->date('tanggal_surat');
            $table->enum('status', ['belum_selesai', 'selesai'])->default('belum_selesai');
            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_checklist')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_surat_jalan');
    }
};