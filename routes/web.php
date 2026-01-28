<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\KategoriBiayaController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\BiayaMaintenanceController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LokasiController;

// Public Routes
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Kendaraan Routes
    Route::prefix('kendaraan')->name('kendaraan.')->group(function () {
        Route::get('/', [KendaraanController::class, 'index'])->name('index');
        Route::post('/', [KendaraanController::class, 'store'])->name('store');
        Route::put('/{id}', [KendaraanController::class, 'update'])->name('update');
        Route::delete('/{id}', [KendaraanController::class, 'destroy'])->name('destroy');
    });

    // Kategori Biaya Routes
    Route::prefix('kategori-biaya')->name('kategori-biaya.')->group(function () {
        Route::get('/', [KategoriBiayaController::class, 'index'])->name('index');
        Route::post('/', [KategoriBiayaController::class, 'store'])->name('store');
        Route::put('/{id}', [KategoriBiayaController::class, 'update'])->name('update');
        Route::delete('/{id}', [KategoriBiayaController::class, 'destroy'])->name('destroy');
    });

    // Trip Routes
    Route::prefix('trip')->name('trip.')->group(function () {
        Route::get('/', [TripController::class, 'index'])->name('index');
        Route::post('/', [TripController::class, 'store'])->name('store');
        Route::put('/{id}', [TripController::class, 'update'])->name('update');
        Route::delete('/{id}', [TripController::class, 'destroy'])->name('destroy');
        Route::patch('/{id}/status', [TripController::class, 'updateStatus'])->name('update-status');
    });

    // Biaya Maintenance Routes (rename dari biaya-operasional)
    Route::prefix('biaya-maintenance')->name('biaya-maintenance.')->group(function () {
        Route::get('/', [BiayaMaintenanceController::class, 'index'])->name('index');
        Route::post('/', [BiayaMaintenanceController::class, 'store'])->name('store');
        Route::put('/{id}', [BiayaMaintenanceController::class, 'update'])->name('update');
        Route::delete('/{id}', [BiayaMaintenanceController::class, 'destroy'])->name('destroy');
    });

    // Laporan Routes
    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('/biaya-kendaraan', [LaporanController::class, 'biayaKendaraan'])->name('biaya-kendaraan');
        Route::get('/uang-sangu', [LaporanController::class, 'uangSangu'])->name('uang-sangu');
    });

    // User Management Routes (hanya untuk owner)
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
    });

    // Lokasi Routes
    Route::prefix('lokasi')->name('lokasi.')->group(function () {
        Route::get('/', [LokasiController::class, 'index'])->name('index');
        Route::post('/', [LokasiController::class, 'store'])->name('store');
        Route::put('/{id}', [LokasiController::class, 'update'])->name('update');
        Route::delete('/{id}', [LokasiController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__.'/settings.php';