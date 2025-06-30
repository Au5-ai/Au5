using Au5.Application.Interfaces;
using Au5.Application.Models.Messages;

namespace Au5.MeetingHub;

public class MeetingHub(IMeetingService meetingService) : Hub
{
    private readonly IMeetingService _meetingService = meetingService;

    public async Task UserJoinedInMeeting(UserJoinedInMeetingMessage msg)
    {
        if (string.IsNullOrWhiteSpace(msg.MeetingId) || msg.User is null)
        {
            return;
        }
        if (string.IsNullOrEmpty(Context.ConnectionId)) return;

        var meeting = _meetingService.AddUserToMeeting(msg.User.Id, msg.MeetingId, msg.Platform);
        if (meeting is not null && meeting.IsActive())
        {
            await Clients.Caller.SendAsync("ReceiveMessage", new MeetingIsActiveMessage()
            {
                BotName = meeting.BotName,
                MeetingId = msg.MeetingId
            });
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, msg.MeetingId);
        await BroadcastToGroupExceptCallerAsync(msg.MeetingId, msg);
    }

    public async Task RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage)
    {
        await BroadcastToGroupExceptCallerAsync(requestToAddBotMessage.MeetingId, requestToAddBotMessage);
    }

    public async Task BotJoinedInMeeting(string meetingId)
    {
        var botName = _meetingService.BotIsAdded(meetingId);
        if (string.IsNullOrWhiteSpace(botName))
        {
            return;
        }
        await BroadcastToGroupExceptCallerAsync(meetingId, new BotJoinedInMeetingMessage() { BotName = botName });
    }

    public async Task Entry(EntryMessage transcription)
    {
        var canBroadcast = _meetingService.UpsertBlock(transcription);
        if (canBroadcast)
        {
            await BroadcastToGroupExceptCallerAsync(transcription.MeetingId, transcription);
        }
    }

    public async Task ReactionApplied(ReactionAppliedMessage reaction)
    {
        _meetingService.AppliedReaction(reaction);
        await BroadcastToGroupExceptCallerAsync(reaction.MeetingId, reaction);
    }

    public async Task PauseAndPlayTranscription(PauseAndPlayTranscriptionMessage message)
    {
        _meetingService.PauseMeeting(message.MeetingId, message.IsPaused);
        await BroadcastToGroupExceptCallerAsync(message.MeetingId, message);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (string.IsNullOrEmpty(Context.ConnectionId)) return;
        //  await Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.GetHttpContext()?.Request.Query["meetingId"] ?? string.Empty);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private async Task BroadcastToGroupExceptCallerAsync(string groupName, Message msg)
    {
        Console.WriteLine($"Broadcasting message of type {msg.Type}");
        await Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", msg);
    }
}


//public void ParticipantJoinMeeting(Participants participants)
//{
//    public record Participants
//{
//    public string MeetingId { get; set; }
//    public List<string> User { get; set; }
//}
//    if (string.IsNullOrWhiteSpace(participants.MeetingId))
//    {
//        return;
//    }
//    if (participants.User is null)
//    {
//        return;
//    }
//    _meetingService.AddParticipantToMeet(participants.User, participants.MeetingId);
//}