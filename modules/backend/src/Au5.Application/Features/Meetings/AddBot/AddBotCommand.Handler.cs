using Au5.Application.Common;
using Au5.Application.Common.Options;
using Au5.Application.Services.Models;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result<AddBotCommandResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IBotFatherAdapter _botFather;
	private readonly IUrlGenerator _meetingUrlService;
	private readonly ICacheProvider _cacheProvider;
	private readonly ICurrentUserService _currentUserService;
	private readonly IDataProvider _dataProvider;
	private readonly IMeetingService _meetingService;
	private readonly OrganizationOptions _organizationOptions;

	public AddBotCommandHandler(
		IApplicationDbContext dbContext,
		IBotFatherAdapter botFather,
		IUrlGenerator meetingUrlService,
		ICacheProvider cacheProvider,
		ICurrentUserService currentUserService,
		IDataProvider dataProvider,
		IMeetingService meetingService,
		IOptions<OrganizationOptions> options)
	{
		_dbContext = dbContext;
		_botFather = botFather;
		_meetingUrlService = meetingUrlService;
		_cacheProvider = cacheProvider;
		_currentUserService = currentUserService;
		_dataProvider = dataProvider;
		_meetingService = meetingService;
		_organizationOptions = options.Value;
	}

	public async ValueTask<Result<AddBotCommandResponse>> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = _dataProvider.NewGuid();
		var hashToken = HashHelper.HashSafe(meetingId.ToString());

		var config = await _dbContext.Set<Organization>().AsNoTracking().FirstOrDefaultAsync(o => o.Id == _currentUserService.OrganizationId, cancellationToken);
		if (config is null)
		{
			return Error.Failure("Organization.NotConfigured", AppResources.Organization.IsNotConfigured);
		}

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = request.MeetId,
			MeetName = "Meeting Transcription",
			BotName = config.BotName,
			IsBotAdded = false,
			BotInviterUserId = _currentUserService.UserId,
			CreatedAt = _dataProvider.Now,
			Platform = request.Platform,
			Status = MeetingStatus.WaitingToAddBot,
			HashToken = hashToken,
		};

		_dbContext.Set<Meeting>().Add(meeting);

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (!dbResult.IsSuccess)
		{
			return Error.Failure("Meeting.FailedToAddBot", AppResources.Meeting.FailedToAddBot);
		}

		var meetingKey = _meetingService.GetMeetingKey(request.MeetId);
		var cachedMeeting = await _cacheProvider.GetAsync<Meeting>(meetingKey);

		if (cachedMeeting is null || cachedMeeting.Status == MeetingStatus.Ended)
		{
			await _cacheProvider.SetAsync(meetingKey, meeting, TimeSpan.FromHours(2));
		}
		else
		{
			cachedMeeting.Id = meetingId;
			await _cacheProvider.SetAsync(meetingKey, cachedMeeting, TimeSpan.FromHours(2));
		}

		var payload = BuildBotPayload(request, config, hashToken);
		await _botFather.CreateBotContainerAsync(_organizationOptions.BotFatherUrl, payload, cancellationToken);
		return new AddBotCommandResponse(meetingId);
	}

	private BotPayload BuildBotPayload(AddBotCommand request, Organization config, string hashToken) =>
		new()
		{
			HubUrl = _organizationOptions.BotHubUrl,
			Platform = request.Platform,
			MeetingUrl = _meetingUrlService.GenerateMeetingUrl(request.Platform, request.MeetId),
			BotDisplayName = config.BotName,
			MeetId = request.MeetId,
			HashToken = hashToken,
			Language = config.Language,
			AutoLeaveSettings = new()
			{
				WaitingEnter = _organizationOptions.AutoLeaveWaitingEnter,
				NoParticipant = _organizationOptions.AutoLeaveNoParticipant,
				AllParticipantsLeft = _organizationOptions.AutoLeaveAllParticipantsLeft
			},
			MeetingSettings = new()
			{
				VideoRecording = _organizationOptions.MeetingVideoRecording,
				AudioRecording = _organizationOptions.MeetingAudioRecording,
				Transcription = _organizationOptions.MeetingTranscription,
				TranscriptionModel = _organizationOptions.MeetingTranscriptionModel,
			}
		};
}
