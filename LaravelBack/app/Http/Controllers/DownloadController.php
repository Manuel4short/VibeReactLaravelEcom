<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Download;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

class DownloadController extends Controller
{
    public function downloadFile($token)
    {
        $download = Download::where('token', $token)->firstOrFail();

        // ✅ Check if already used
        if ($download->used) {
            return response()->json(['message' => 'This download link has already been used.'], 403);
        }

        // ✅ Check if expired
        if ($download->expires_at && Carbon::parse($download->expires_at)->isPast()) {
            return response()->json(['message' => 'This download link has expired.'], 403);
        }

        // ✅ Verify the file exists before download
        $filePath = public_path('products/' . $download->file_path);
        if (!File::exists($filePath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        // ✅ Mark as used
        $download->update(['used' => true]);

        // ✅ Send the file as a response
        return response()->download($filePath);
    }
}
