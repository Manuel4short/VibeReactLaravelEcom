<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCartItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();  // auto-increment primary key
            $table->unsignedBigInteger('product_id');  // foreign key for products
            $table->unsignedBigInteger('user_id');  // foreign key for users
            $table->integer('quantity');  // quantity of the product in the cart
            $table->timestamps();  // created_at and updated_at timestamps
    
            // Foreign key constraints
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('cart_items');
    }
    
}
