using Microsoft.AspNetCore.SignalR;
using System.Text;

namespace Au5.MeetingHub;

public class MeetingHub : Hub
{
    static MeetingHub()
    {
        Console.OutputEncoding = Encoding.UTF8;
    }

    public async Task JoinMeeting(string meetingId, string userId, string fullName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, meetingId);
        await SendToOthersInGroupAsync(meetingId, "JoinMeeting", new
        {
            userId,
            fullName
        });

        LogInfo($"User {userId} joined meeting {meetingId}");
        // send existing participants back to this user if needed
    }

    public async Task RealTimeTranscription(string meetingId, string id, string speaker, string transcript)
    {
        var timestamp = DateTime.UtcNow.ToString("o");

        await SendToOthersInGroupAsync(meetingId, "RealTimeTranscription", new
        {
            id,
            speaker,
            transcript,
            timestamp
        });

        LogInfo($"[{meetingId}] {id} | {speaker}: {transcript}");
    }

    public async Task StartTranscription(string meetingId, string userId)
    {
        await SendToOthersInGroupAsync(meetingId, "StartTranscription", new
        {
            userId
        });

        LogInfo($"User {userId} started transcription in meeting {meetingId}");
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
