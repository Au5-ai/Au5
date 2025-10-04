using Au5.Application.Common;

namespace Au5.Application.Features.SystemConfigs.GetConfig;

public class SystemConfigQueryHandler : IRequestHandler<SystemConfigQuery, Result<SystemConfigResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public SystemConfigQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<SystemConfigResponse>> Handle(SystemConfigQuery _, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<SystemConfig>().FirstOrDefaultAsync(cancellationToken);

		return existingConfig is null
			? Error.Failure(description: AppResources.System.IsNotConfigured)
			: new SystemConfigResponse
			{
				OrganizationName = existingConfig.OrganizationName,
				BotName = existingConfig.BotName,
				HubUrl = existingConfig.HubUrl,
				Direction = existingConfig.Direction,
				Language = existingConfig.Language,
				ServiceBaseUrl = existingConfig.ServiceBaseUrl,
				BotFatherUrl = existingConfig.BotFatherUrl,
				BotHubUrl = existingConfig.BotHubUrl,
				PanelUrl = existingConfig.PanelUrl,
				OpenAIToken = existingConfig.OpenAIToken,
				OpenAIProxyUrl = existingConfig.OpenAIProxyUrl,
				AIProviderUrl = existingConfig.AIProviderUrl,
				AutoLeaveWaitingEnter = existingConfig.AutoLeaveWaitingEnter,
				AutoLeaveNoParticipant = existingConfig.AutoLeaveNoParticipant,
				AutoLeaveAllParticipantsLeft = existingConfig.AutoLeaveAllParticipantsLeft,
				MeetingVideoRecording = existingConfig.MeetingVideoRecording,
				MeetingAudioRecording = existingConfig.MeetingAudioRecording,
				MeetingTranscription = existingConfig.MeetingTranscription,
				MeetingTranscriptionModel = existingConfig.MeetingTranscriptionModel,
				SmtpUseSSl = existingConfig.SmtpUseSSl,
				SmtpHost = existingConfig.SmtpHost,
				SmtpPort = existingConfig.SmtpPort,
				SmtpUser = existingConfig.SmtpUser,
				SmtpPassword = existingConfig.SmtpPassword
			};
	}
}
