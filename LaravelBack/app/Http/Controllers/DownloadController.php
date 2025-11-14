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

            // ✅ Check if expired
            if ($download->expires_at && Carbon::parse($download->expires_at)->isPast()) {
                return response()->json(['message' => 'This download link has expired.'], 403);
            }

            // ✅ Check download limit (3 max)
            if ($download->download_count >= 3) {
                return response()->json(['message' => 'Download limit reached for this item.'], 403);
            }

            // ✅ Build file path
            $filePath = public_path('storage/' . $download->file_path);

            if (!File::exists($filePath)) {
                return response()->json(['message' => 'File not found.'], 404);
            }

            // ✅ Increase download count
            $download->increment('download_count');

            return response()->download($filePath);
        }




        public function listDownloads(Request $request)
        {
            $request->validate(['email' => 'required|email']);

            $downloads = Download::where('buyer_email', $request->email)->get();

            return response()->json($downloads);
        }


}
