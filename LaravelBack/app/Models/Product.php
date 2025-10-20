<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'file_path'
    ];


    // protected $casts = [
    //     'price' => 'decimal:10,2'
    // ];

        protected $casts = [
        'price' => 'float'
    ];
}
