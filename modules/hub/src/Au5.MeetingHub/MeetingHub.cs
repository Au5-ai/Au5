using Au5.MeetingHub.Mock.Interfaces;
using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub;

public class MeetingHub(ILogger<MeetingHub> logger, IMeetingService meetingService, ITranscriptionService transcriptionService) : Hub
{
    private readonly ILogger<MeetingHub> _logger = logger;
    private readonly IMeetingService _meetingService = meetingService;
    private readonly ITranscriptionService _transcriptionService = transcriptionService;

    public async Task BotJoinMeeting(JoinMeeting joinMeeting)
    {
        //if (string.IsNullOrWhiteSpace(joinMeeting.MeetingId))
        //{
        //    return;
        //}
        //await Groups.AddToGroupAsync(Context.ConnectionId, joinMeeting.MeetingId);
    }

    public async Task JoinMeeting(JoinMeeting joinMeeting)
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
        await SendToOthersInGroupAsync(joinMeeting.MeetingId, new UserJoinedInMeetingMessage(joinMeeting.User));
    }

    public void ParticipantJoinMeeting(Participants participants)
    {
        if (string.IsNullOrWhiteSpace(participants.MeetingId))
        {
            return;
        }
        if (participants.User is null)
        {
            return;
        }
        _meetingService.AddParticipantToMeet(participants.User, participants.MeetingId);
    }

    public async Task TranscriptionEntry(TranscriptionEntryMessage transcription)
    {
        _transcriptionService.UpsertBlock(transcription);
        await SendToOthersInGroupAsync(transcription.MeetingId, transcription);
    }

    public async Task ReactionApplied(ReactionAppliedMessage reaction)
    {
        _transcriptionService.AppliedReaction(reaction);
        await SendToOthersInGroupAsync(reaction.MeetingId, reaction);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToOthersInGroupAsync(string groupName, IMessage msg)
        => Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", msg);
}