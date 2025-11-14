<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Models\Download;
use Illuminate\Support\Str;
use Carbon\Carbon;



class CheckoutController extends Controller
{
   public function checkout(Request $request)
    {
        // debug_print_backtrace(); // Add this line
        try {
        $request->validate([
            'cart' => 'required|array',
            'cart.*.id' => 'required|integer',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:paystack',
            'total_amount' => 'required|numeric|min:0',
            'reference' => 'required_without:payment_id|nullable|string',
            'payment_id' => 'required_without:reference|nullable|string',
            'email' => 'required|email',
        ]);


            $userId = auth()->id() ?? 1; // Fallback for testing
        

            // Create order
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending_payment',
                'total_price' => $request->total_amount,                
                'reference' => $request->reference,
            ]);

            // Add order items
            foreach ($request->cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            // Record payment
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $request->payment_method,
                'amount' => $request->total_amount,
                'status' => 'pending_payment',
                'reference' => $request->reference ?? null,
                'payment_id' => $request->payment_id ?? null, // 👈 Add this line
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order_id' => $order->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Checkout Error:', ['exception' => $e]);
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }

public function verifyPayment(Request $request)
{
    $request->validate([
        'reference' => 'nullable|string',
        'payment_id' => 'nullable|string',
        'payment_method' => 'required|string|in:paystack',
    ]);

    // Find the payment using reference or payment_id
    $payment = Payment::where('reference', $request->reference)
        ->orWhere('payment_id', $request->payment_id)
        ->firstOrFail();

    $order = Order::findOrFail($payment->order_id);

    switch ($request->payment_method) {
        case 'paystack':
            $secretKey = env('PAYSTACK_SECRET_KEY', '');
            if (!$secretKey)
                return response()->json(['success' => false, 'message' => 'Paystack secret key missing'], 500);

            $ref = $request->reference ?? $payment->reference;
            $response = Http::withToken($secretKey)
                ->get("https://api.paystack.co/transaction/verify/{$ref}");

            \Log::info('Paystack verify response', ['response' => $response->json()]);

            if ($response->successful() && $response['data']['status'] === 'success') {
                // ✅ Mark order and payment as completed
                $order->status = 'paid';
                $payment->status = 'completed';
                $order->save();
                $payment->save();

                // ✅ Generate downloads for all order items
                $orderItems = OrderItem::where('order_id', $order->id)->get();
                $downloadLinks = [];

                foreach ($orderItems as $orderItem) {
                    $token = Str::random(32);
                    $expiresAt = Carbon::now()->addDays(3);

                    Download::create([
                        'product_id' => $orderItem->product_id,
                        'order_id' => $order->id,
                        'file_path' => $orderItem->product->file_path ?? null,
                        'buyer_email' => $request->email,
                        'token' => $token,
                        'expires_at' => $expiresAt,
                        'used' => false,
                    ]);

                    $downloadLinks[] = url("/download/{$token}");
                }

                               // ✅ Send email with links
                $linksText = implode("\n", $downloadLinks);
                Mail::raw(
                    "Your payment was successful! 🎉\n\nHere are your download links:\n\n{$linksText}\n\nEach link expires in 3 days and is limited to 3 downloads.",
                    function ($message) use ($request) {
                        $message->to($request->email)
                                ->subject('Your Product Download Links');
                    }
                );


                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified and download links sent to your email',
                ]);
            }
            break;

        default:
            return response()->json(['success' => false, 'message' => 'Invalid payment method'], 400);
    }

    return response()->json(['success' => false, 'message' => 'Payment verification failed'], 400);
}


    
}