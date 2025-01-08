<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;

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
        // Retrieve all products from the database
        $products = Product::all();

        // Return the products as a JSON response
        return response()->json($products);
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
        $product = Product::find($id);
    
        if ($product) {
            // Only update fields that are provided in the request
            $product->name = $request->input('name', $product->name);
            $product->price = $request->input('price', $product->price);
            $product->description = $request->input('description', $product->description);
    
            // If a new file (image) is uploaded, handle it
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('public', $filename);
                $product->file_path = $filename;
            }
    
            $product->save(); // Save the updated product
    
            return response()->json(['message' => 'Product updated successfully!']);
        } else {
            return response()->json(['message' => 'Product not found!'], 404);
        }
    }
    
    
}

