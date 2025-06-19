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
            throw new ArgumentException("MeetingId cannot be empty", nameof(joinMeeting.MeetingId));
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, joinMeeting.MeetingId);
    }

    public async Task JoinMeeting(JoinMeeting joinMeeting)
    {
        if (string.IsNullOrWhiteSpace(joinMeeting.MeetingId))
        {
            throw new ArgumentException("MeetingId cannot be empty", nameof(joinMeeting.MeetingId));
        }
        if (joinMeeting.User is null)
        {
            throw new ArgumentNullException(nameof(joinMeeting.User), "User cannot be null");
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, joinMeeting.MeetingId);
        await SendToOthersInGroupAsync(joinMeeting.MeetingId, new UserJoinedInMeetingMessage(joinMeeting.User));
    }

    public async Task TranscriptionEntry(TranscriptionEntryMessage transcription)
    {
        _transcriptionService.UpsertBlock(transcription);
        await SendToOthersInGroupAsync(transcription.MeetingId, transcription);
    }

    public async Task ReactionApplied(ReactionAppliedMessage reaction)
    {
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