using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Au5.Application.Services;
using Au5.Application.Services.Models;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result<Guid>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IBotFatherAdapter _botFather;
	private readonly IMeetingUrlService _meetingUrlService;
	private readonly ICacheProvider _cacheProvider;

	public AddBotCommandHandler(
		IApplicationDbContext dbContext,
		IBotFatherAdapter botFather,
		IMeetingUrlService meetingUrlService,
		ICacheProvider cacheProvider)
	{
		_dbContext = dbContext;
		_botFather = botFather;
		_meetingUrlService = meetingUrlService;
		_cacheProvider = cacheProvider;
	}

	public async ValueTask<Result<Guid>> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = Guid.NewGuid();
		var hashToken = HashHelper.HashSafe(meetingId.ToString());

		var config = await _dbContext.Set<SystemConfig>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure(description: AppResources.SystemIsNotConfigured);
		}

		var meeting = new Meeting
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
		};

		_dbContext.Set<Meeting>().Add(meeting);

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (!dbResult.IsSuccess)
		{
			return Error.Failure(description: AppResources.FailedToAddBot);
		}

		var cachedMeeting = await _cacheProvider.GetAsync<Meeting>(MeetingService.GetMeetingKey(request.MeetId));

		if (cachedMeeting is null)
		{
			await _cacheProvider.SetAsync(MeetingService.GetMeetingKey(request.MeetId), meeting, TimeSpan.FromHours(1));
		}
		else
		{
			cachedMeeting.Id = meetingId;
		}

		var payload = BuildBotPayload(request, config, hashToken);
		await _botFather.CreateBotAsync(config.BotFatherUrl, payload, cancellationToken);
		return meetingId;
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
