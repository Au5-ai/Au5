using Microsoft.AspNetCore.SignalR;

namespace Au5.MeetingHub;

public class MeetingHub : Hub
{
    public async Task JoinMeeting(string meetingId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, meetingId);
        Console.WriteLine($"Client joined meeting: {meetingId}");
    }

    public async Task SendMessage(string meetingId, string sender, string text)
    {
        var timestamp = DateTime.UtcNow.ToString("o");

        await Clients.Group(meetingId).SendAsync("ReceiveMessage", new
        {
            sender,
            text,
            timestamp
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }
}
