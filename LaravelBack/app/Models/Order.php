<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

  protected $fillable = [
    'user_id',    
    'status',
    'reference',
    'total_price', // ✅ Add this line
];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }


     public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }


}
