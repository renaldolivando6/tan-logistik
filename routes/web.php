<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\KategoriBiayaController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\BiayaOperasionalController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChecklistSuratJalanController;

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
        Route::post('/{id}/konfirmasi-pengembalian', [TripController::class, 'konfirmasiPengembalian'])->name('konfirmasi-pengembalian');
    });

    // Biaya Operasional Routes
    Route::prefix('biaya-operasional')->name('biaya-operasional.')->group(function () {
        Route::get('/', [BiayaOperasionalController::class, 'index'])->name('index');
        Route::post('/', [BiayaOperasionalController::class, 'store'])->name('store');
        Route::put('/{id}', [BiayaOperasionalController::class, 'update'])->name('update');
        Route::delete('/{id}', [BiayaOperasionalController::class, 'destroy'])->name('destroy');
    });

    // Checklist Surat Jalan Routes
    Route::prefix('checklist-surat-jalan')->name('checklist-surat-jalan.')->group(function () {
        Route::get('/', [ChecklistSuratJalanController::class, 'index'])->name('index');
        Route::post('/', [ChecklistSuratJalanController::class, 'store'])->name('store');
        Route::put('/{id}', [ChecklistSuratJalanController::class, 'update'])->name('update');
        Route::delete('/{id}', [ChecklistSuratJalanController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/toggle-checklist', [ChecklistSuratJalanController::class, 'toggleChecklist'])->name('toggle-checklist');
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
});

require __DIR__.'/settings.php';