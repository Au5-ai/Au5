using Au5.Application.Interfaces;
using Au5.Application.Models.Messages;

namespace Au5.BackEnd.Hubs;

public class MeetingHub(IMeetingService meetingService) : Hub
{
	private const string METHOD = "ReceiveMessage";
	private readonly IMeetingService meetingService = meetingService;

	public async Task UserJoinedInMeeting(UserJoinedInMeetingMessage msg)
	{
		if (string.IsNullOrWhiteSpace(msg.MeetingId) || msg.User is null || string.IsNullOrWhiteSpace(Context.ConnectionId))
		{
			return;
		}

		var meeting = meetingService.AddUserToMeeting(msg);
		if (meeting is not null && meeting.IsActive() && meeting.IsBotAdded)
		{
			await Clients.Caller.SendAsync(METHOD, new MeetingIsActiveMessage()
			{
				BotName = meeting.BotName,
				MeetingId = msg.MeetingId,
			});
		}

		await Groups.AddToGroupAsync(Context.ConnectionId, msg.MeetingId);
		await BroadcastToGroupExceptCallerAsync(msg.MeetingId, msg);
	}

	public async Task RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage)
	{
		if (string.IsNullOrWhiteSpace(requestToAddBotMessage.MeetingId) || requestToAddBotMessage.User is null)
		{
			return;
		}

		meetingService.RequestToAddBot(requestToAddBotMessage);
		await BroadcastToGroupExceptCallerAsync(requestToAddBotMessage.MeetingId, requestToAddBotMessage);
	}

	public async Task BotJoinedInMeeting(string meetingId)
	{
		var botName = meetingService.BotIsAdded(meetingId);
		if (string.IsNullOrWhiteSpace(botName))
		{
			return;
		}

		await BroadcastToGroupExceptCallerAsync(meetingId, new BotJoinedInMeetingMessage() { BotName = botName });
	}

	public async Task Entry(EntryMessage transcription)
	{
		var canBroadcast = meetingService.UpsertBlock(transcription);
		if (canBroadcast)
		{
			await BroadcastToGroupExceptCallerAsync(transcription.MeetingId, transcription);
		}
	}

	public async Task ReactionApplied(ReactionAppliedMessage reaction)
	{
		meetingService.AppliedReaction(reaction);
		await BroadcastToGroupExceptCallerAsync(reaction.MeetingId, reaction);
	}

	public async Task PauseAndPlayTranscription(PauseAndPlayTranscriptionMessage message)
	{
		meetingService.PauseMeeting(message.MeetingId, message.IsPaused);
		await BroadcastToGroupExceptCallerAsync(message.MeetingId, message);
	}

	public override async Task OnDisconnectedAsync(Exception exception)
	{
		if (string.IsNullOrEmpty(Context.ConnectionId))
		{
			return;
		}

		await base.OnDisconnectedAsync(exception);
	}

	/// <summary>
	/// Helper to send message to others in the same meeting group.
	/// </summary>
	private async Task BroadcastToGroupExceptCallerAsync(string groupName, Message msg)
	{
		await Clients.OthersInGroup(groupName).SendAsync(METHOD, msg);
	}
}


// public void ParticipantJoinMeeting(Participants participants)
// {
//    public record Participants
// {
//    public string MeetingId { get; set; }
//    public List<string> User { get; set; }
// }
//    if (string.IsNullOrWhiteSpace(participants.MeetingId))
//    {
//        return;
//    }
//    if (participants.User is null)
//    {
//        return;
//    }
//    meetingService.AddParticipantToMeet(participants.User, participants.MeetingId);
// }
