<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; // Add this for using Auth

class UserController extends Controller
{
    // Register function
    public function register(Request $req)
    {
        $user = new User;
        $user->name = $req->input('name');
        $user->email = $req->input('email');
        $user->password = Hash::make($req->input('password'));
        $user->save();
    
        // Return a success message
        return response()->json(['success' => true, 'message' => 'Registration successful']);
    }
    
    // Login function
    public function login(Request $req)
    {
        // Find the user by email
        $user = User::where('email', $req->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Email is incorrect'], 404);
        }
        
        // Check the password
        if (!Hash::check($req->password, $user->password)) {
            return response()->json(['error' => 'Password is incorrect'], 401);
        }

        // Return user info, including role
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role, // Include role in the response
        ]);
    }
}
