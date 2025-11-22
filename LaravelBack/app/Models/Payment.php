<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{

     protected $fillable = [
        'order_id',
        'amount',
        'status',
        'reference',
        'payment_method',
        'payment_id',
        'ip_address'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

}
