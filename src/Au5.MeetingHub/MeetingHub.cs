using Microsoft.AspNetCore.SignalR;
using System.Text;

namespace Au5.MeetingHub;

public class MeetingHub : Hub
{
    public async Task JoinMeeting(string meetingId, string userId, string fullname)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, meetingId);
        await Clients.OthersInGroup(meetingId).SendAsync("ReceiveMessage", new
        {
            header = new { messageType = "JoinMeeting" },
            payload = new
            {
                userId,
                fullname
            }
        });
        Console.OutputEncoding = Encoding.UTF8;
        Console.WriteLine($"User {userId} joined meeting {meetingId}");
        // send the others data to this connection.
    }

    public async Task RealTimeTranscription(string meetingId, string id, string speaker, string transcript)
    {
        var timestamp = DateTime.UtcNow.ToString("o");

        await Clients.OthersInGroup(meetingId).SendAsync("ReceiveMessage", new
        {
            header = new { messageType = "RealTimeTranscription" },
            payload = new
            {
                id,
                speaker,
                transcript,
                timestamp
            }

        });
        Console.OutputEncoding = Encoding.UTF8;
        Console.WriteLine($"{meetingId}, {id}, {speaker},{transcript}");
    }

    public async Task StartTranscription(string meetingId, string userId)
    {
        await Clients.OthersInGroup(meetingId).SendAsync("ReceiveMessage", new
        {
            header = new { messageType = "StartTranscription" },
            payload = new
            {
                userId,
            }
        });
        Console.OutputEncoding = Encoding.UTF8;
        Console.WriteLine($"User {userId} started transcription in meeting {meetingId}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
