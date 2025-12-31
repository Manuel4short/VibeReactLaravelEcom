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
use Illuminate\Support\Facades\DB;
use App\Models\EmailLog;




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
                 'ip_address' => $request->ip(),  // 👈 ADD THIS
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
try {
\Log::info('Verify payment started', $request->all());


    $request->validate([
        'reference' => 'nullable|string',
        'payment_id' => 'nullable|string',
        'payment_method' => 'required|string|in:paystack',
        'email' => 'required|email',
    ]);

    $email = $request->input('email');

    // 🔍 Log search criteria
    \Log::info('Attempting to find payment', [
        'reference' => $request->reference,
        'payment_id' => $request->payment_id,
    ]);

    $payment = Payment::where('reference', $request->reference)
        ->orWhere('payment_id', $request->payment_id)
        ->firstOrFail();

    \Log::info('Payment record found', $payment->toArray());

    $order = Order::findOrFail($payment->order_id);
    \Log::info('Order found', $order->toArray());

        // ✅ Prevent double processing / double email
    if ($payment->status === 'completed') {
        return response()->json([
            'success' => true,
            'message' => 'Payment already processed',
        ]);
    }


    switch ($request->payment_method) {
        case 'paystack':
            $secretKey = config('services.paystack.secret');

            if (!$secretKey) {
                \Log::error('Paystack secret key is missing!');
                return response()->json([
                    'success' => false,
                    'message' => 'Paystack secret key missing'
                ], 500);
            }

            $ref = $request->reference ?? $payment->reference;

            \Log::info('Sending verify request to Paystack', [
                'reference' => $ref
            ]);

            $response = Http::withToken($secretKey)
                ->get("https://api.paystack.co/transaction/verify/{$ref}");

            \Log::info('Paystack response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            $data = $response->json();

            if (
                ($data['status'] ?? false) === true &&
                ($data['data']['status'] ?? '') === 'success'
            )
            
            
            {
                \Log::info('Payment successful – updating payment and order');

                $downloadLinks = [];

               DB::transaction(function() use ($order, $payment, $request, $email,  &$downloadLinks ) {
                    // Update order and payment
                    $order->status = 'paid';
                    $payment->status = 'completed';
                    $payment->ip_address = $payment->ip_address ?? $request->ip();
                    $order->save();
                    $payment->save();

                    // Generate download links with eager loading
                    $orderItems = OrderItem::with('product')->where('order_id', $order->id)->get();

                    
                    foreach ($orderItems as $item) {
                        $token = Str::random(32);
                        $expiresAt = Carbon::now()->addDays(3);

                        Download::create([
                            'product_id' => $item->product_id,
                            'order_id' => $order->id,
                            'file_path' => $item->product->file_path ?? null,
                            'buyer_email' => $email,
                            'token' => $token,
                            'expires_at' => $expiresAt,
                            'used' => false,
                            'buyer_ip' => $request->ip(),
                            'download_count' => 0,
                        ]);

                        $downloadLinks[] = url("/download/{$token}");
                    }

                });

                
                    // Send email immediately (synchronous)
                        $messageBody =
                        "Your payment was successful! 🎉\n\n" .
                        "Here are your download links:\n\n" .
                        implode("\n", $downloadLinks) .
                        "\n\nEach link expires in 3 days and is limited to 3 downloads.";

                    try {
                        Mail::raw($messageBody, function ($message) use ($email) {
                            $message->to($email)
                                    ->subject('Your Product Download Links');
                        });
                    } catch (\Throwable $e) {
                          EmailLog::create([
                                'email' => $email,
                                'subject' => 'Your Product Download Links',
                                'body' => $messageBody,
                                'sent' => false,
                                'error' => $e->getMessage(),
                            ]);


                        \Log::error('Email sending failed', [
                            'email' => $email,
                            'error' => $e->getMessage(),
                        ]);
                    }


                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified and download links sent to your email',
                ]);
            }

            \Log::warning('Payment verification failed', [
                'reference' => $ref,
                'response' => $response->json()
            ]);

            break;
    }

    return response()->json([
        'success' => false,
        'message' => 'Payment verification failed'
    ], 400);

} catch (\Exception $e) {
    \Log::error('Verify payment exception: ' . $e->getMessage());
    \Log::error($e->getTraceAsString());

    return response()->json([
        'success' => false,
        'message' => $e->getMessage()
    ], 500);
}


}



    
}