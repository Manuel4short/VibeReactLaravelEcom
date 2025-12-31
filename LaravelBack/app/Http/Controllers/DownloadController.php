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

           // Prevent double-counting accidental repeated requests 
           if ( $download->updated_at && $download->updated_at->diffInSeconds(Carbon::now()) < 2 ) 
              {
                 // Do NOT increment to avoid double count
              }
              else {
                 $download->download_count += 1; $download->save();
             }

           return response()->download($filePath, null, [
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            ]);



        }



}
