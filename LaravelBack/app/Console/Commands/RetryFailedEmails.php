<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RetryFailedEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:retry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Retry sending failed emails from EmailLog';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $failedEmails = \App\Models\EmailLog::where('sent', false)->get();

        foreach ($failedEmails as $emailLog) {
            try {
                \Illuminate\Support\Facades\Mail::raw($emailLog->body, function ($message) use ($emailLog) {
                    $message->to($emailLog->email)
                            ->subject($emailLog->subject);
                });
                $emailLog->sent = true;
                $emailLog->error = null;
                $emailLog->save();
            } catch (\Throwable $e) {
                $emailLog->error = $e->getMessage();
                $emailLog->save();
            }
        }
    }

}
