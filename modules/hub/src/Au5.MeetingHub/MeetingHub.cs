using Au5.MeetingHub.Mock.Interfaces;
using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub;

public class MeetingHub(ILogger<MeetingHub> logger, IUserService userService, IMeetingService meetingService, ITranscriptionService transcriptionService) : Hub
{
    private readonly ILogger<MeetingHub> _logger = logger;
    private readonly IUserService _userService = userService;
    private readonly IMeetingService _meetingService = meetingService;
    private readonly ITranscriptionService _transcriptionService = transcriptionService;

    public async Task BotJoinMeeting(JoinMeeting joinMeeting)
    {
        if (string.IsNullOrWhiteSpace(joinMeeting.MeetingId))
        {
            _logger.LogError("JoinMeeting called with empty MeetingId");
            throw new ArgumentException("MeetingId cannot be empty", nameof(joinMeeting.MeetingId));
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, joinMeeting.MeetingId);
    }

    public async Task JoinMeeting(JoinMeeting joinMeeting)
    {
        if (string.IsNullOrWhiteSpace(joinMeeting.MeetingId))
        {
            _logger.LogError("JoinMeeting called with empty MeetingId");
            throw new ArgumentException("MeetingId cannot be empty", nameof(joinMeeting.MeetingId));
        }
        if (joinMeeting.User is not null)
        {
            _logger.LogError("JoinMeeting called with null User");
            throw new ArgumentNullException(nameof(joinMeeting.User), "User cannot be null");
        }
        var users = _userService.AddUserToMeeting(joinMeeting.User, joinMeeting.MeetingId);
        await Groups.AddToGroupAsync(Context.ConnectionId, joinMeeting.MeetingId);
        var meetStarted = _meetingService.IsStarted(joinMeeting.MeetingId);

        if (meetStarted)
        {
            await SendToYourselfAsync(new MeetingStartedMessage(IsStarted: true));
        }

        await SendToYourselfAsync(new ListOfUsersInMeetingMessage(users));
        await SendToOthersInGroupAsync(joinMeeting.MeetingId, new UserJoinedInMeetingMessage(joinMeeting.User));
    }

    public async Task NotifyRealTimeTranscription(TranscriptionEntry transcription)
    {
        _transcriptionService.UpsertBlock(transcription);
        await SendToOthersInGroupAsync(transcription.MeetingId, new TranscriptionEntryMessage()
        {
            MeetingId = transcription.MeetingId,
            Speaker = transcription.Speaker,
            Timestamp = transcription.Timestamp,
            Transcript = transcription.Transcript,
            TranscriptionBlockId = transcription.TranscriptBlockId
        });
    }

    public async Task ReactionApplied(ReactionApplied data)
    {
        await SendToOthersInGroupAsync(data.MeetingId, new ReactionAppliedMessage()
        {
            MeetingId = data.MeetingId,
            Reaction = data.Reaction,
            TranscriptBlockId = data.TranscriptBlockId,
            User = data.User
        });
    }

    public async Task TriggerTranscriptionStart(StartTranscription data)
    {
        _meetingService.Run(data.MeetingId, data.UserId);
        await SendToOthersInGroupAsync(data.MeetingId, new TranscriptionStartedMessage(data.UserId));
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

    /// <summary>
    /// Helper to send message to others in the same meeting group.
    /// </summary>
    private Task SendToYourselfAsync(IMessage msg)
        => Clients.Caller.SendAsync("ReceiveMessage", msg);
}