using Au5.MeetingHub.Mock;
using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub;

public class MeetingHub : Hub
{
    private readonly ILogger<MeetingHub> _logger;
    private readonly IUserService _userService;
    private readonly IMeetingService _meetingService;

    public MeetingHub(ILogger<MeetingHub> logger)
    {
        _logger = logger;
        _userService = new UserService();
        _meetingService = new MeetingService();
    }

    public async Task JoinMeeting(JoinMeeting joinMeeting)
    {
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

    public async Task NotifyRealTimeTranscription(RealTimeTranscription transcription)
        => await SendToOthersInGroupAsync(transcription.MeetingId, new RealTimeTranscriptionMessage()
        {
            MeetingId = transcription.MeetingId,
            Speaker = transcription.Speaker,
            Timestamp = transcription.Timestamp,
            Transcript = transcription.Transcript,
            TranscriptionBlockId = transcription.TranscriptionBlockId
        });

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