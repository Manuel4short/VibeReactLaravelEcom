<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Spatie\PdfToImage\Pdf; // ← ADD THIS
use Illuminate\Support\Facades\Storage; // ← ADD THIS


class ProductController extends Controller
{
   public function addProduct(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:jpg,jpeg,pjpeg,png,pdf|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $file->getPathname());
                finfo_close($finfo);

                // Generate unique filename
                $originalFilename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('products', $originalFilename, 'public');

                // Log file storage
                Log::info('File stored:', [
                    'filename' => $originalFilename,
                    'path' => $filePath,
                    'mime' => $mime
                ]);

                // Save product to database
                $product = new Product;
                $product->name = $request->input('name');
                $product->price = $request->input('price');
                $product->description = $request->input('description');
                $product->file_path = 'products/' . $originalFilename;

                // Convert PDF to image if it's a PDF
                if ($mime === 'application/pdf') {
                    try {
                        $previewImage = $this->convertPdfToImage($file, $originalFilename, 'products');
                        $product->preview_image = 'products/' . $previewImage;
                    } catch (\Exception $e) {
                        Log::error('PDF conversion failed, proceeding with save:', [
                            'error' => $e->getMessage(),
                            'file' => $originalFilename
                        ]);
                        $product->preview_image = null; // Save without preview if conversion fails
                    }
                } else {
                    $product->preview_image = null;
                }

                $product->save();

                Log::info('Product saved:', $product->toArray());

                return response()->json(['message' => 'Product added successfully', 'product' => $product], 201);
            } else {
                return response()->json(['message' => 'File upload failed'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Error in addProduct:', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }
    public function list()
    {
        return response()->json(Product::all());
    }
    

    public function delete($id)
    {
        try {
            // Find the product by ID
            $product = Product::find($id);

            if ($product) {
                // Delete the product
                $product->delete();

                // Return success response
                return response()->json(['message' => 'Product deleted successfully'], 200);
            } else {
                // Return error if product not found
                return response()->json(['message' => 'Product not found'], 404);
            }
        } catch (\Exception $e) {
            \Log::error('Error:', ['exception' => $e]);
            // Catch any exceptions and return a 500 error
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }



    public function searchProduct($key)
    {
        // Validate the search key (optional)
        $validator = Validator::make(['key' => $key], [
            'key' => 'required|string|max:255'
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // Search for products based on the key
            $products = Product::where('name', 'LIKE', "%{$key}%")
                ->orWhere('description', 'LIKE', "%{$key}%")
                ->get();

            // Return the search results as a JSON response
            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Error:', ['exception' => $e]);
            // Catch any exceptions and return a 500 error
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }
    
   public function update(Request $request, $id)
{
    try {
        $product = Product::findOrFail($id);
        Log::info('Received request data:', $request->all());

        // Define validator before use
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0|max:99999999.99',
            'description' => 'nullable|string',
            'file' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ]);

        // Check if validation fails
        if ($validator->fails()) {
            Log::error('Validation failed:', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file->getPathname());
            finfo_close($finfo);
            Log::info('File details:', ['mime' => $mime, 'size' => $file->getSize(), 'original_name' => $file->getClientOriginalName()]);

            // Allowed MIME types for images and e-books
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
            if (!in_array($mime, $allowedMimes)) {
                throw \Illuminate\Validation\ValidationException::withMessages(['file' => ['The file must be a type: jpeg, png, webp, pdf, epub, or mobi.']]);
            }

            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('products', $filename, 'public');
            $product->file_path = "products/$filename";

            // Convert PDF to image if it's a PDF
            if ($mime === 'application/pdf') {
                try {
                    $previewImage = $this->convertPdfToImage($file, $filename, 'products');
                    $product->preview_image = "products/$previewImage";
                } catch (\Exception $e) {
                    Log::error('PDF conversion failed, proceeding with save:', [
                        'error' => $e->getMessage(),
                        'file' => $filename
                    ]);
                    $product->preview_image = null; // Save without preview if conversion fails
                }
            } else {
                $product->preview_image = "products/$filename"; // Use the uploaded image directly
            }
        }

        // Update fields
        $product->name = $request->input('name', $product->name);
        $product->price = $request->input('price', $product->price);
        $product->description = $request->input('description', $product->description);        

        $product->save();
        // Log the updated product for debugging
        Log::info('Updated Product:', $product->toArray());

        return response()->json(['message' => 'Product updated successfully!', 'product' => $product]);
    } catch (\Exception $e) {
        Log::error('Error updating product:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['message' => 'Error updating product.', 'error' => $e->getMessage()], 500);
    }
}
    


    
// To generate pdf image
public function generatePreview(Request $request)
{
    try {
        if (!$request->hasFile('file') || $request->file('file')->getMimeType() !== 'application/pdf') {
            return response()->json(['error' => 'Invalid file, PDF required'], 400);
        }

        $file = $request->file('file');
        $filename = 'temp_' . time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('public/temp', $filename);

        $previewImage = $this->convertPdfToImage($file, $filename, 'temp');
        $previewUrl = url("storage/temp/{$previewImage}");

        // Schedule deletion of temp files
        \Illuminate\Support\Facades\Storage::disk('public')->deleteAfter(60, "temp/{$filename}");
        \Illuminate\Support\Facades\Storage::disk('public')->deleteAfter(60, "temp/{$previewImage}");

        return response()->json(['preview_url' => $previewUrl]);
    } catch (\Exception $e) {
        Log::error('Preview generation failed:', ['error' => $e->getMessage()]);
        return response()->json(['preview_url' => url('storage/default.png')], 500);
    }
}

// Update convertPdfToImage to handle errors better
  private function convertPdfToImage($file, $originalFilename, $subfolder = 'products')
{
    try {
        // Explicitly set Ghostscript PATH for PHP environment
        putenv('PATH=' . (getenv('PATH') ?: '') . ';C:\Program Files\gs\gs10.06.0\bin;C:\Program Files\ImageMagick-7.1.2-Q16-HDRI');
        ini_set('imagick.pdf_delegate', 'C:\Program Files\gs\gs10.06.0\bin\gs.exe');
        Log::info('Current PATH in convertPdfToImage:', ['path' => getenv('PATH')]); // ← ADD THIS: Debug PATH
        Log::info('Ghostscript availability:', ['gs_path' => shell_exec('where gs')]); // ← ADD THIS: Debug gs location

        $cacheKey = 'pdf_thumbnail_' . md5($originalFilename);
        $outputFilename = pathinfo($originalFilename, PATHINFO_FILENAME) . '.jpg';
        $thumbnailPath = storage_path("app/public/{$subfolder}/" . $outputFilename);

        // Check if thumbnail exists (cache)
        if (file_exists($thumbnailPath)) {
            Log::info('Using cached PDF thumbnail:', ['preview_image' => $outputFilename]);
            return $outputFilename;
        }

        $pdfPath = storage_path("app/public/{$subfolder}/" . $originalFilename);
        if (!file_exists($pdfPath)) {
            throw new \Exception("PDF file not found at: $pdfPath");
        }

        

        $pdf = new Pdf($pdfPath);       
        $pdf->save($thumbnailPath);

        Log::info('PDF converted to image preview:', [
            'pdf_file' => $originalFilename,
            'preview_image' => $outputFilename
        ]);

        return $outputFilename;
    } catch (\Exception $e) {
        Log::error('PDF to image conversion failed:', [
            'error' => $e->getMessage(),
            'file' => $originalFilename,
            'trace' => $e->getTraceAsString()
        ]);
        return 'default.png';
    }
}
}


