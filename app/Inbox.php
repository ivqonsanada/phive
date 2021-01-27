<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Inbox extends Model
{
    protected $guarded = [];

    protected $casts = [
        'recipient_id' => 'integer',
        'sender_id' => 'integer',
        'team_invitation_id' => 'integer',
        'project_invitation_id' => 'integer',
        'message_body_id' => 'integer',
        'is_read' => 'boolean'
    ];

    public function team_invitation()
    {
        return $this->belongsTo('App\TeamInvitation');
    }

    public function project_invitation()
    {
        return $this->belongsTo('App\ProjectInvitation');
    }

    public function message_body ()
    {
        return $this->belongsTo('App\MessageBody');
    }

    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public static function getInboxes ($user) {
        return Inbox::where('recipient_id', $user->id)->with(['message_body.sender:id,photo_url,tagname,first_name,last_name,email', 'team_invitation.from', 'project_invitation.project', 'project_invitation.from'])->latest()->get();
    }
}
