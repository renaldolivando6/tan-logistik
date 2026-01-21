<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Check if current user is owner (id = 1)
     */
    private function checkOwner()
    {
        if (auth()->id() !== 1) {
            abort(403, 'Unauthorized. Only owner can access this page.');
        }
    }

    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $this->checkOwner();

        $users = DB::table('users')
            ->select('id', 'name', 'email', 'email_verified_at', 'created_at')
            ->orderBy('id')
            ->get();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $this->checkOwner();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::table('users')->insert([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $this->checkOwner();

        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            abort(404, 'User not found.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'updated_at' => now(),
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        DB::table('users')->where('id', $id)->update($data);

        return back()->with('success', 'User berhasil diupdate.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $this->checkOwner();

        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            abort(404, 'User not found.');
        }

        // Prevent deleting owner account
        if ((int) $id === 1) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus akun owner.']);
        }

        DB::table('users')->where('id', $id)->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}