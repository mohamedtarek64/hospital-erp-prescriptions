<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

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
    return redirect('/login');
});

Route::get('/login', function () {
    return view('auth.login');
});

Route::post('/login', function (Request $request) {
    // التحقق من البيانات
    if ($request->email === 'admin@hospital.com' && $request->password === 'password123') {
        // إنشاء session
        session(['user' => [
            'id' => 1,
            'name' => 'Admin User',
            'email' => 'admin@hospital.com',
            'role' => 'admin'
        ]]);
        
        // إعادة التوجيه للفرونت
        return redirect('http://localhost:3000?token=valid&user=' . urlencode(json_encode([
            'id' => 1,
            'name' => 'Admin User',
            'email' => 'admin@hospital.com',
            'role' => 'admin'
        ])));
    }
    
    return back()->with('error', 'بيانات الدخول غير صحيحة');
});

Route::get('/logout', function () {
    session()->forget('user');
    return redirect('/login');
});
