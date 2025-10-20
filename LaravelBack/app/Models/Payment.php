<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{

protected static function boot()
{
    parent::boot();

    static::creating(function ($model) {
        $model->uuid = (string) \Illuminate\Support\Str::uuid();
    });
}

}
