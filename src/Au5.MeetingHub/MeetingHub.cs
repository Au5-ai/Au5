using Au5.MeetingHub.Models;
using Microsoft.AspNetCore.SignalR;
using System.Text;

namespace Au5.MeetingHub;


public class User
{
    public string Id { get; set; }
    public string FullName { get; set; }
}

public class MeetingHub : Hub
{
    private static readonly Dictionary<string, HashSet<User>> _activeUsers = [];

    static MeetingHub()
    {
        Console.OutputEncoding = Encoding.UTF8;
    }

    public async Task JoinMeeting(JoinMeetingDto data)
    {
        LogInfo($"User {data.UserId} joined meeting {data.MeetingId}");
        await Groups.AddToGroupAsync(Context.ConnectionId, data.MeetingId);

        var existingMettingId = _activeUsers.TryGetValue(data.MeetingId, out HashSet<User> users);
        if (existingMettingId)
        {
            await SendToYourselfInGroupAsync(data.MeetingId, "MeetHasBeenStarted", new
            {
                ActiveUsers = users
            });

            users.Add(new User() { Id = data.UserId, FullName = data.FullName });
        }
        else
        {
            users = [new User() { Id = data.UserId, FullName = data.FullName }];
            _activeUsers.Add(data.MeetingId, users);
        }

        await SendToOthersInGroupAsync(data.MeetingId, "JoinMeeting", new
        {
            data.UserId,
            data.FullName
        });
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

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToYourselfInGroupAsync(string groupName, string messageType, object payload)
    {
        return Clients.Caller.SendAsync("ReceiveMessage", new
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
