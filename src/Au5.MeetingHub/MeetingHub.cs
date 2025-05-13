using Microsoft.AspNetCore.SignalR;

namespace Au5.MeetingHub;

public class MeetingHub : Hub
{
    public async Task JoinMeeting(string meetingId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, meetingId);
    }

    public async Task SendMessage(string meetingId, string id, string speaker, string transcript)
    {
        var timestamp = DateTime.UtcNow.ToString("o");

        await Clients.Group(meetingId).SendAsync("ReceiveMessage", new
        {
            id,
            speaker,
            transcript,
            timestamp
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
