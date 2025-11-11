// <copyright file="MeetingHub.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using Au5.Application.Common.Abstractions;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Hubs;

[Authorize]
public class MeetingHub(IMeetingService meetingService) : Hub
{
	private const string METHOD = "ReceiveMessage";

	public async Task UserJoinedInMeeting(UserJoinedInMeetingMessage msg)
	{
		if (string.IsNullOrWhiteSpace(msg.MeetId) || msg.User is null || string.IsNullOrWhiteSpace(Context.ConnectionId))
		{
			return;
		}

		var meeting = await meetingService.AddUserToMeeting(msg);
		if (meeting is not null && meeting.IsActive() && meeting.IsBotAdded)
		{
			await Clients.Caller.SendAsync(METHOD, new MeetingIsActiveMessage()
			{
				BotName = meeting.BotName,
				MeetId = msg.MeetId,
			}).ConfigureAwait(false);
		}

		await Groups.AddToGroupAsync(Context.ConnectionId, msg.MeetId).ConfigureAwait(false);
		await BroadcastToGroupExceptCallerAsync(msg.MeetId, msg).ConfigureAwait(false);
	}

	public async Task RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage)
	{
		await BroadcastToGroupExceptCallerAsync(requestToAddBotMessage.MeetId, requestToAddBotMessage).ConfigureAwait(false);
	}

	public async Task BotJoinedInMeeting(string meetId)
	{
		var botName = await meetingService.BotIsAdded(meetId);
		if (string.IsNullOrWhiteSpace(botName))
		{
			return;
		}

		await BroadcastToGroupExceptCallerAsync(meetId, new BotJoinedInMeetingMessage() { BotName = botName }).ConfigureAwait(false);
	}

	public async Task Entry(EntryMessage transcription)
	{
		var canBroadcast = await meetingService.UpsertBlock(transcription);
		if (canBroadcast)
		{
			await BroadcastToGroupExceptCallerAsync(transcription.MeetId, transcription).ConfigureAwait(false);
		}
	}

	public async Task GuestJoinedInMeeting(GuestJoinedInMeetingMessage message)
	{
		await meetingService.AddGuestsToMeet(message.MeetId, message.Guests);
	}

	public async Task ReactionApplied(ReactionAppliedMessage reaction)
	{
		await meetingService.AppliedReaction(reaction);
		await BroadcastToGroupExceptCallerAsync(reaction.MeetId, reaction).ConfigureAwait(false);
	}

	public async Task PauseAndPlayTranscription(PauseAndPlayTranscriptionMessage message)
	{
		_ = await meetingService.PauseMeeting(message.MeetId, message.IsPaused);
		await BroadcastToGroupExceptCallerAsync(message.MeetId, message).ConfigureAwait(false);
	}

	public async Task CloseMeeting(CloseMeetingMessage closeMeetingMessage)
	{
		await BroadcastToGroupExceptCallerAsync(closeMeetingMessage.MeetId, closeMeetingMessage).ConfigureAwait(false);
	}

	/// <inheritdoc/>
	public override async Task OnDisconnectedAsync(Exception exception)
	{
		if (string.IsNullOrEmpty(Context.ConnectionId))
		{
			return;
		}

		await base.OnDisconnectedAsync(exception).ConfigureAwait(false);
	}

	/// <summary>
	/// Helper to send message to others in the same meeting group.
	/// </summary>
	private async Task BroadcastToGroupExceptCallerAsync(string groupName, Message msg)
	{
		await Clients.OthersInGroup(groupName).SendAsync(METHOD, msg).ConfigureAwait(false);
	}
}
