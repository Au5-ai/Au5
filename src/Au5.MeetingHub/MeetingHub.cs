using Au5.MeetingHub.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Au5.MeetingHub;

public class MeetingHub(ILogger<MeetingHub> logger) : Hub
{
    private static readonly HashSet<string> _startedMeetings = [];
    private static readonly ConcurrentDictionary<string, HashSet<User>> _activeUsers = [];
    private static readonly ConcurrentDictionary<string, (string MeetingId, User User)> _connections = new();
    private readonly ILogger<MeetingHub> _logger = logger;

    public async Task JoinMeeting(JoinMeetingDto data)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, data.MeetingId);
        var currentUser = new User()
        {
            FullName = data.User.FullName,
            Id = data.User.Id,
            PictureUrl = data.User.PictureUrl,
        };
        _connections[Context.ConnectionId] = (data.MeetingId, currentUser);

        var existingMettingId = _activeUsers.TryGetValue(data.MeetingId, out HashSet<User> users);
        if (!existingMettingId)
        {
            users = [currentUser];
            _activeUsers.TryAdd(data.MeetingId, users);
        }
        else
        {
            var existingUser = users.FirstOrDefault(x => x.Id == data.User.Id);
            if (existingUser is null)
            {
                users.Add(currentUser);
            }
        }

        var meetStarted = _startedMeetings.FirstOrDefault(x => x == data.MeetingId);

        if (meetStarted is not null)
        {
            await SendToYourselfAsync(new Message()
            {
                Header = new Header()
                {
                    Type = MessageTypes.NotifyMeetHasBeenStarted,
                }
            });
        }

        await SendToYourselfAsync(new Message()
        {
            Header = new Header()
            {
                Type = MessageTypes.ListOfUsersInMeeting,
            },
            Payload = new
            {
                Users = users
            }
        });

        await SendToOthersInGroupAsync(data.MeetingId, new Message()
        {
            Header = new Header()
            {
                Type = MessageTypes.NotifyUserJoining,
            },
            Payload = new
            {
                User = currentUser
            }
        });
    }

    public async Task NotifyRealTimeTranscription(TranscriptionDto data)
    {
        await SendToOthersInGroupAsync(data.MeetingId, new Message()
        {
            Header = new Header() { Type = MessageTypes.NotifyRealTimeTranscription },
            Payload = data
        });

        _logger.LogInformation("User {UserId} speak {MeetingId} with {Transcript}", data.Speaker.Id, data.MeetingId, data.Transcript);

    }

    public async Task TriggerTranscriptionStart(StartTranscriptionDto data)
    {
        _startedMeetings.Add(data.MeetingId);
        await SendToOthersInGroupAsync(data.MeetingId, new Message()
        {
            Header = new Header() { Type = MessageTypes.TriggerTranscriptionStart },
            Payload = data
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connections.TryRemove(Context.ConnectionId, out var info) && _activeUsers.TryGetValue(info.MeetingId, out var users))
        {
            users.Remove(info.User);

            await SendToOthersInGroupAsync(info.MeetingId, new Message
            {
                Header = new Header { Type = MessageTypes.NotifyUserLeft },
                Payload = new { info.User }
            });
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToOthersInGroupAsync(string groupName, Message msg)
    {
        return Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", msg);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToYourselfAsync(Message msg)
    {
        return Clients.Caller.SendAsync("ReceiveMessage", msg);
    }
}