<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;


class ProductController extends Controller
{
    public function addProduct(Request $request)
    {
        // Added validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:jpg,jpeg,png|max:2048'
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // Check if the file is present
            if ($request->hasFile('file')) {
                // Store the file and get the path
                $filePath = $request->file('file')->store('products', 'public');

                // Save the product to the database
                $product = new Product;
                $product->name = $request->input('name');
                $product->price = $request->input('price');
                $product->description = $request->input('description');
                $product->file_path = $filePath;
                $product->save();

                return response()->json(['message' => 'Product added successfully', 'product' => $product], 201);
            } else {
                // Return error if file upload fails
                return response()->json(['message' => 'File upload failed'], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Error:', ['exception' => $e]);
            // Catch any exceptions and return a 500 error
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
    
            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'price' => 'sometimes|required|numeric',
                'description' => 'nullable|string',
                'file' => 'sometimes|file|mimes:jpg,jpeg,png|max:2048',
            ]);
    
            // Update fields
            $product->name = $request->input('name', $product->name);
            $product->price = $request->input('price', $product->price);
            $product->description = $request->input('description', $product->description);
    
            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('public/products', $filename);
                $product->file_path = "products/$filename";
            }
    
            $product->save();
            // Log the updated product for debugging
            Log::info('Updated Product:', $product->toArray());
    
            return response()->json(['message' => 'Product updated successfully!', 'product' => $product]);
        } catch (\Exception $e) {
            \Log::error('Error updating product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating product.'], 500);
        }
    }
    
}

