<?php

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/login', LoginController::class)->name('login')->middleware('guest');
Route::get('/dashboard', DashboardController::class)->name('dashboard')->middleware('auth');
