<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->foreignId('asal_id')->nullable()->after('kendaraan_id')->constrained('lokasi')->onDelete('set null');
            $table->foreignId('tujuan_id')->nullable()->after('asal_id')->constrained('lokasi')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['asal_id']);
            $table->dropForeign(['tujuan_id']);
            $table->dropColumn(['asal_id', 'tujuan_id']);
        });
    }
};