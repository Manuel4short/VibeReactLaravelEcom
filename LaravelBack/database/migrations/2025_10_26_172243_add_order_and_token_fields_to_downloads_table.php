<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOrderAndTokenFieldsToDownloadsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('downloads', function (Blueprint $table) {
            //
              // Link each download to an order
            $table->unsignedBigInteger('order_id')->after('id');
            
            // Unique download token
            $table->string('token')->unique()->after('order_id');
            
            // Expiration time — nullable for lifetime downloads
            $table->timestamp('expires_at')->nullable()->after('token');
            
            // Track if the download link was already used
            $table->boolean('used')->default(false)->after('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('downloads', function (Blueprint $table) {
            //
            $table->dropColumn(['order_id', 'token', 'expires_at', 'used']);
        });
    }
}
