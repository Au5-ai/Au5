using Au5.Application.Common;

namespace Au5.Application.Features.SystemConfigs.SetConfig;

public class SystemConfigCommandHandler : IRequestHandler<SystemConfigCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IDataProvider _dataProvider;

	public SystemConfigCommandHandler(IApplicationDbContext dbContext, IDataProvider dataProvider)
	{
		_dbContext = dbContext;
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result> Handle(SystemConfigCommand request, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<SystemConfig>().FirstOrDefaultAsync(cancellationToken);

		if (existingConfig is not null)
		{
			existingConfig.OrganizationName = request.OrganizationName;
			existingConfig.BotName = request.BotName;
			existingConfig.HubUrl = request.HubUrl;
			existingConfig.Direction = request.Direction;
			existingConfig.Language = request.Language;
			existingConfig.ServiceBaseUrl = request.ServiceBaseUrl;
			existingConfig.PanelUrl = request.PanelUrl;
			existingConfig.BotFatherUrl = request.BotFatherUrl;
			existingConfig.BotHubUrl = request.BotHubUrl;
			existingConfig.AIProviderUrl = request.AIProviderUrl;
			existingConfig.AutoLeaveWaitingEnter = request.AutoLeaveWaitingEnter;
			existingConfig.AutoLeaveNoParticipant = request.AutoLeaveNoParticipant;
			existingConfig.AutoLeaveAllParticipantsLeft = request.AutoLeaveAllParticipantsLeft;
			existingConfig.MeetingVideoRecording = request.MeetingVideoRecording;
			existingConfig.MeetingAudioRecording = request.MeetingAudioRecording;
			existingConfig.MeetingTranscription = request.MeetingTranscription;
			existingConfig.MeetingTranscriptionModel = request.MeetingTranscriptionModel;
			existingConfig.OpenAIToken = request.OpenAIToken;
			existingConfig.OpenAIProxyUrl = request.OpenAIProxyUrl;
			existingConfig.SmtpPort = request.SmtpPort;
			existingConfig.SmtpHost = request.SmtpHost;
			existingConfig.SmtpPassword = request.SmtpPassword;
			existingConfig.SmtpUser = request.SmtpUser;
			existingConfig.SmtpUseSSl = request.SmtpUseSSl;
		}
		else
		{
			_dbContext.Set<SystemConfig>().Add(new SystemConfig()
			{
				Id = _dataProvider.NewGuid(),
				OrganizationName = request.OrganizationName,
				BotName = request.BotName,
				HubUrl = request.HubUrl,
				Direction = request.Direction,
				Language = request.Language,
				ServiceBaseUrl = request.ServiceBaseUrl,
				BotFatherUrl = request.BotFatherUrl,
				BotHubUrl = request.BotHubUrl,
				PanelUrl = request.PanelUrl,
				AIProviderUrl = request.AIProviderUrl,
				OpenAIToken = request.OpenAIToken,
				OpenAIProxyUrl = request.OpenAIProxyUrl,
				AutoLeaveWaitingEnter = request.AutoLeaveWaitingEnter,
				AutoLeaveNoParticipant = request.AutoLeaveNoParticipant,
				AutoLeaveAllParticipantsLeft = request.AutoLeaveAllParticipantsLeft,
				MeetingVideoRecording = request.MeetingVideoRecording,
				MeetingAudioRecording = request.MeetingAudioRecording,
				MeetingTranscription = request.MeetingTranscription,
				MeetingTranscriptionModel = request.MeetingTranscriptionModel,
				SmtpUser = request.SmtpUser,
				SmtpPassword = request.SmtpPassword,
				SmtpHost = request.SmtpHost,
				SmtpPort = request.SmtpPort,
				SmtpUseSSl = request.SmtpUseSSl,
			});
		}

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.System.FailedToConfig);
	}
}
