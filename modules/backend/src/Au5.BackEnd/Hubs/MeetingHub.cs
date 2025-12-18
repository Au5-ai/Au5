// <copyright file="MeetingHub.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using Au5.Application.Common.Abstractions;
using Au5.Shared;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Hubs;

[Authorize]
public class MeetingHub(IMeetingService meetingService, ICurrentUserService currentUserService) : Hub
{
	private const string METHOD = "ReceiveMessage";
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public override async Task OnConnectedAsync()
	{
		var httpContext = Context.GetHttpContext();
		var userType = httpContext?.User.FindFirst(ClaimConstants.Type)?.Value;

		if (userType == "BotConnection")
		{
			var meetId = httpContext.User.FindFirst(ClaimConstants.MeetId)?.Value;

			if (!string.IsNullOrWhiteSpace(meetId))
			{
				await Groups.AddToGroupAsync(Context.ConnectionId, meetId);
			}
		}

		await base.OnConnectedAsync();
	}

	public async Task UserJoinedInMeeting(UserJoinedInMeetingMessage msg)
	{
		if (string.IsNullOrWhiteSpace(msg.MeetId) || !_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(Context.ConnectionId))
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

	public async Task BotJoinedInMeeting(string meetId, string botName)
	{
		if (!await meetingService.BotIsAdded(meetId, botName))
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
