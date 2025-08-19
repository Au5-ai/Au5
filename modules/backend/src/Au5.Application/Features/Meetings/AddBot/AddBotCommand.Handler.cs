using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Au5.Application.Services.Models;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IBotFatherAdapter _botFather;
	private readonly IMeetingUrlService _meetingUrlService;

	public AddBotCommandHandler(
		IApplicationDbContext dbContext,
		IBotFatherAdapter botFather,
		IMeetingUrlService meetingUrlService)
	{
		_dbContext = dbContext;
		_botFather = botFather;
		_meetingUrlService = meetingUrlService;
	}

	public async ValueTask<Result> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = Guid.NewGuid();
		var hashToken = HashHelper.HashSafe(meetingId.ToString());

		var config = await _dbContext.Set<SystemConfig>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure(AppResources.SystemIsNotConfigured);
		}

		_dbContext.Set<Meeting>().Add(new Meeting
		{
			Id = meetingId,
			MeetId = request.MeetId,
			MeetName = "Meeting Transcription",
			BotName = request.BotName,
			IsBotAdded = false,
			BotInviterUserId = request.UserId,
			CreatedAt = DateTime.UtcNow,
			Platform = request.Platform,
			Status = MeetingStatus.AddingBot,
			HashToken = hashToken
		});

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (!dbResult.IsSuccess)
		{
			return Error.Failure(description: AppResources.FailedToAddBot);
		}

		var payload = BuildBotPayload(request, config, hashToken);
		var response = await _botFather.CreateBotAsync(config.BotFatherUrl, payload, cancellationToken);

		return Result.Success();
	}

	private BotPayload BuildBotPayload(AddBotCommand request, SystemConfig config, string hashToken) =>
		new()
		{
			HubUrl = config.BotHubUrl,
			Platform = request.Platform,
			MeetingUrl = _meetingUrlService.GetMeetingUrl(request.Platform, request.MeetId),
			BotDisplayName = config.BotName,
			MeetId = request.MeetId,
			HashToken = hashToken,
			Language = config.Language,
			AutoLeaveSettings = new()
			{
				WaitingEnter = config.AutoLeaveWaitingEnter,
				NoParticipant = config.AutoLeaveNoParticipant,
				AllParticipantsLeft = config.AutoLeaveAllParticipantsLeft
			},
			MeetingSettings = new()
			{
				VideoRecording = config.MeetingVideoRecording,
				AudioRecording = config.MeetingAudioRecording,
				Transcription = config.MeetingTranscription,
				TranscriptionModel = config.MeetingTranscriptionModel,
			}
		};
}
