<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Testingblade;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// routes/web.php
Route::get('/show-image', function () {
    return view('show_image',[TestingController::class, 'show']); // Points to resources/views/show_image.blade.php
});


