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
            'payment_method' => 'required|string|in:paystack,flutterwave,stripe,bank,cash',
            'total_amount' => 'required|numeric|min:0',
            'reference' => 'required_without:payment_id|nullable|string',
            'payment_id' => 'required_without:reference|nullable|string',
            'email' => 'required|email',
        ]);


            $userId = auth()->id() ?? 1; // Fallback for testing
        

            // Create order
            $order = Order::create([
                'user_id' => $userId,
                'status' => in_array($request->payment_method, ['bank', 'cash']) ? 'pending' : 'pending_payment',
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
                'status' => in_array($request->payment_method, ['bank', 'cash']) ? 'pending' : 'pending_payment',
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
        'payment_method' => 'required|string|in:paystack,flutterwave,stripe',
    ]);

    // Find the payment using Paystack’s identifiers, not your DB id
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
                $order->status = 'paid';
                $payment->status = 'completed';
                $order->save();
                $payment->save();

                $orderItems = OrderItem::where('order_id', $order->id)->get();
                $downloadLinks = [];

                foreach ($orderItems as $item) {
                    $token = Str::random(32);
                    $expiresAt = Carbon::now()->addDays(3);

                    $download = Download::create([
                        'product_id' => $item->product_id,
                        'order_id' => $order->id,
                        'file_path' => $item->product->file_path ?? null,
                        'token' => $token,
                        'expires_at' => $expiresAt,
                        'used' => false,
                    ]);

                    $downloadLinks[] = url("/download/{$token}");
                }

                $linksText = implode("\n", $downloadLinks);
                Mail::raw(
                    "Your payment was successful! 🎉\n\nHere are your download links (valid for 3 days):\n\n{$linksText}",
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

        case 'flutterwave':
            $secretKey = env('FLUTTERWAVE_SECRET_KEY', '');
            if (!$secretKey) return response()->json(['success' => false, 'message' => 'Flutterwave secret key missing'], 500);
            $response = Http::withHeaders(['Authorization' => 'Bearer ' . $secretKey])
                ->get("https://api.flutterwave.com/v3/transactions/{$reference}/verify");
            if ($response->successful() && $response['data']['status'] === 'successful') {
                $order->status = 'paid';
                $payment->status = 'completed';
                $order->save();
                $payment->save();
                return response()->json(['success' => true, 'message' => 'Payment verified']);
            }
            break;

        case 'stripe':
            // Handled via webhook; assume verified if reference matches
            $order->status = 'paid';
            $payment->status = 'completed';
            $order->save();
            $payment->save();
            return response()->json(['success' => true, 'message' => 'Payment verified']);
            break;

        default:
            return response()->json(['success' => false, 'message' => 'Invalid payment method'], 400);
    }

    return response()->json(['success' => false, 'message' => 'Payment verification failed'], 400);
}

    public function stripePayment(Request $request)
    {
        $request->validate([
            'cart' => 'required|array',
            'email' => 'required|email',
            'amount' => 'required|numeric|min:0',
        ]);

        \Stripe\Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
        $cart = $request->cart;
        $lineItems = array_map(function ($item) {
            return [
                'price_data' => [
                    'currency' => 'ngn',
                    'product_data' => ['name' => $item['name']],
                    'unit_amount' => $item['price'] * 100, // In kobo
                ],
                'quantity' => $item['quantity'],
            ];
        }, $cart);

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => 'http://localhost:3000/success?reference={CHECKOUT_SESSION_ID}',
            'cancel_url' => 'http://localhost:3000/cart',
            'customer_email' => $request->email,
        ]);

        return response()->json(['id' => $session->id]);
    }

    public function stripeWebhook(Request $request)
{
    $payload = $request->getContent();
    $sigHeader = $request->header('Stripe-Signature');
    $endpointSecret = env('STRIPE_WEBHOOK_SECRET', '');

    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        \Log::info('Stripe Webhook Event', ['type' => $event->type, 'data' => $event->data->object]);
        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $order = Order::where('reference', $session->id)->first();
            if ($order) {
                $order->status = 'paid';
                $payment = Payment::where('order_id', $order->id)->first();
                $payment->status = 'completed';
                $order->save();
                $payment->save();
            }
            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'ignored']);
    } catch (\Exception $e) {
        \Log::error('Stripe Webhook Error', ['message' => $e->getMessage()]);
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
    }
}
}