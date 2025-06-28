using Au5.Application.Interfaces;
using Au5.Application.Models.Messages;
using System.Threading;

namespace Au5.MeetingHub;

public class MeetingHub(IMeetingService meetingService) : Hub
{
    private readonly IMeetingService _meetingService = meetingService;

    public async Task UserJoinedInMeeting(UserJoinedInMeetingMessage msg, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(msg.MeetingId) || msg.User is null)
        {
            return;
        }
        if (string.IsNullOrEmpty(Context.ConnectionId)) return;

        _meetingService.AddUserToMeeting(msg.User.Id, msg.MeetingId, msg.Platform);
        await Groups.AddToGroupAsync(Context.ConnectionId, msg.MeetingId);
        await BroadcastToGroupExceptCallerAsync(msg.MeetingId, msg, cancellationToken);
    }

    public async Task RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage, CancellationToken cancellationToken)
    {
        await BroadcastToGroupExceptCallerAsync(requestToAddBotMessage.MeetingId, requestToAddBotMessage, cancellationToken);
    }

    public async Task BotJoinedInMeeting(string meetingId, CancellationToken cancellationToken)
    {
        var botName = _meetingService.BotIsAdded(meetingId);
        if (string.IsNullOrWhiteSpace(botName))
        {
            return;
        }
        await BroadcastToGroupExceptCallerAsync(meetingId, new BotJoinedInMeetingMessage() { BotName = botName }, cancellationToken);
    }

    public async Task Entry(EntryMessage transcription, CancellationToken cancellationToken)
    {
        var isMeetingPaused = _meetingService.IsPaused(transcription.MeetingId);
        if (isMeetingPaused)
        {
            return;
        }
        _meetingService.UpsertBlock(transcription);
        await BroadcastToGroupExceptCallerAsync(transcription.MeetingId, transcription, cancellationToken);
    }

    public async Task ReactionApplied(ReactionAppliedMessage reaction, CancellationToken cancellationToken)
    {
        _meetingService.AppliedReaction(reaction);
        await BroadcastToGroupExceptCallerAsync(reaction.MeetingId, reaction, cancellationToken);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (string.IsNullOrEmpty(Context.ConnectionId)) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.GetHttpContext()?.Request.Query["meetingId"] ?? string.Empty);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private async Task BroadcastToGroupExceptCallerAsync(string groupName, Message msg, CancellationToken cancellationToken)
        => await Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", msg, cancellationToken);
}


//public async Task PauseTranscription(User user, string meetingId, bool isPause)
//{
//    if (string.IsNullOrWhiteSpace(meetingId))
//    {
//        return;
//    }
//    _meetingService.PauseMeeting(meetingId, isPause);

//    await BroadcastToGroupExceptCallerAsync(meetingId, new GeneralMessage(meetingId, $"{user.FullName} paused transcription !"));
//}


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