<?php

namespace App\Http\Controllers\Inbox;

use App\Http\Controllers\Controller;
use App\Inbox;
use Illuminate\Http\Request;

class InboxController extends Controller
{
    public function index(Request $request)
    {
        $inboxes = Inbox::getInboxes($request->user());
        Inbox::where('recipient_id', $request->user()->id)->update(['is_read' => true]);

        return response()->json($inboxes);
    }
}
