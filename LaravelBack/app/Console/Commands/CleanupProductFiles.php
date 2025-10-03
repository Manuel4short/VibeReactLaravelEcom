<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;

class CleanupProductFiles extends Command
{
    protected $signature = 'cleanup:product-files';
    protected $description = 'Delete files in products directory not referenced in products table';

    public function handle()
    {
        $this->info('Starting product files cleanup...');

        // Get all file paths from the database
        $referencedFiles = Product::pluck('file_path')
            ->merge(Product::pluck('preview_image'))
            ->filter() // Remove null values
            ->map(function ($path) {
                return basename($path); // Extract filename from path
            })
            ->unique()
            ->toArray();

        // Get all files in the products directory
        $storedFiles = Storage::disk('public')->files('products');

        // Exclude default.png from deletion
        $protectedFiles = ['default.png'];

        // Find files not in the database and not protected
        $filesToDelete = array_diff(
            array_map('basename', $storedFiles),
            $referencedFiles,
            $protectedFiles
        );

        // Delete unreferenced files
        foreach ($filesToDelete as $file) {
            Storage::disk('public')->delete("products/$file");
            $this->info("Deleted unreferenced file: products/$file");
        }

        if (empty($filesToDelete)) {
            $this->info('No unreferenced files found.');
        }

        $this->info('Cleanup completed.');
    }
}