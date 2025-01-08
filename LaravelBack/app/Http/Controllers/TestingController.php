<?php
class Testingblade extends Controller
{
public function  show($id)

{
    // Retrieve the product by its ID
    $product = Product::first();

    // Pass the product to the view
    return view('show_image', compact('product'));
}
}