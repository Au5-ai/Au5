using Au5.MeetingHub.Models;
using Microsoft.AspNetCore.SignalR;
using System.Text;

namespace Au5.MeetingHub;

public class MeetingHub : Hub
{
    static MeetingHub()
    {
        Console.OutputEncoding = Encoding.UTF8;
    }

    public async Task JoinMeeting(JoinMeetingDto data)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, data.MeetingId);
        await SendToOthersInGroupAsync(data.MeetingId, "JoinMeeting", new
        {
            data.UserId,
            data.FullName
        });

        LogInfo($"User {data.UserId} joined meeting {data.MeetingId}");
    }

    public async Task RealTimeTranscription(TranscriptionDto data)
    {
        var timestamp = DateTime.UtcNow.ToString("o");

        await SendToOthersInGroupAsync(data.MeetingId, "RealTimeTranscription", new
        {
            data.Id,
            data.Speaker,
            data.Transcript,
            timestamp
        });

        LogInfo($"[{data.MeetingId}] {data.Id} | {data.Speaker}: {data.Transcript}");
    }

    public async Task StartTranscription(StartTranscriptionDto data)
    {
        await SendToOthersInGroupAsync(data.MeetingId, "StartTranscription", new
        {
            data.UserId
        });

        LogInfo($"User {data.UserId} started transcription in meeting {data.MeetingId}");
    }


    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // broadcast disconnection info here if needed.
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToOthersInGroupAsync(string groupName, string messageType, object payload)
    {
        return Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", new
        {
            header = new { messageType },
            payload
        });
    }

    private static void LogInfo(string message)
    {
        Console.WriteLine(message);
    }
}
