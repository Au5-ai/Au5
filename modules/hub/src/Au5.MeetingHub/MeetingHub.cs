namespace Au5.MeetingHub;

public class MeetingHub(IMeetingService meetingService) : Hub
{
    private readonly IMeetingService _meetingService = meetingService;

    public async Task UserJoinedInMeeting(UserJoinedInMeetingMessage joinMeeting)
    {
        if (string.IsNullOrWhiteSpace(joinMeeting.MeetingId))
        {
            return;
        }
        if (joinMeeting.User is null)
        {
            return;
        }
        _meetingService.AddUserToMeeting(joinMeeting.User, joinMeeting.MeetingId, joinMeeting.Platform);
        await Groups.AddToGroupAsync(Context.ConnectionId, joinMeeting.MeetingId);
        await SendToOthersInGroupAsync(joinMeeting.MeetingId, joinMeeting);
    }

    public async Task RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage)
    {
        await SendToOthersInGroupAsync(requestToAddBotMessage.MeetingId, requestToAddBotMessage);
    }

    public async Task BotJoinedInMeeting(string meetingId)
    {
        var botName = _meetingService.BotIsAdded(meetingId);
        if (string.IsNullOrWhiteSpace(botName))
        {
            return;
        }
        await SendToOthersInGroupAsync(meetingId, new BotJoinedInMeetingMessage() { BotName = botName });
    }

    public async Task Entry(EntryMessage transcription)
    {
        var isMeetingPaused = _meetingService.IsPaused(transcription.MeetingId);
        if (isMeetingPaused)
        {
            return;
        }
        _meetingService.UpsertBlock(transcription);
        await SendToOthersInGroupAsync(transcription.MeetingId, transcription);
    }

    public async Task ReactionApplied(ReactionAppliedMessage reaction)
    {
        _meetingService.AppliedReaction(reaction);
        await SendToOthersInGroupAsync(reaction.MeetingId, reaction);
    }

    //public async Task PauseTranscription(User user, string meetingId, bool isPause)
    //{
    //    if (string.IsNullOrWhiteSpace(meetingId))
    //    {
    //        return;
    //    }
    //    _meetingService.PauseMeeting(meetingId, isPause);

    //    await SendToOthersInGroupAsync(meetingId, new GeneralMessage(meetingId, $"{user.FullName} paused transcription !"));
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

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToOthersInGroupAsync(string groupName, Message msg)
        => Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", msg);
}