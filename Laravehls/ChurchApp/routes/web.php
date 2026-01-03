<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
});

Route::get('/admin', function () {
    return view('signin');
});

Route::prefix('admin')->group(function () {
    Route::get('/DASHBOARD', function () {
        return view('admin');
    });
    
    Route::get('/ACCOUNTS', function () {
        return view('accounts');
    });
    
    Route::get('/CALENDAR', function () {
        return view('calendar');
    });

    Route::get('/PROFILE', function () {
        return view('profile');
    });

    Route::get('/REPORTS', function () {
        return view('reports');
    });

    Route::get('/SERVICES', function () {
        return view('services');
    });
});