<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Download extends Model
{
    use HasFactory;

     protected $fillable = [
        'product_id',
        'file_path',
        'order_id',
        'token',
        'expires_at',
        'used',
        'download_count',
        'buyer_email'

    ];


      // Optional: relation to Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
