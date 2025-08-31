using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.SystemConfigs.SetConfig;

public class SystemConfigCommandHandler : IRequestHandler<SystemConfigCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;

	public SystemConfigCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
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
			existingConfig.AutoLeaveWaitingEnter = request.AutoLeaveWaitingEnter;
			existingConfig.AutoLeaveNoParticipant = request.AutoLeaveNoParticipant;
			existingConfig.AutoLeaveAllParticipantsLeft = request.AutoLeaveAllParticipantsLeft;
			existingConfig.MeetingVideoRecording = request.MeetingVideoRecording;
			existingConfig.MeetingAudioRecording = request.MeetingAudioRecording;
			existingConfig.MeetingTranscription = request.MeetingTranscription;
			existingConfig.MeetingTranscriptionModel = request.MeetingTranscriptionModel;
			existingConfig.OpenAIToken = request.OpenAIToken;
		}
		else
		{
			_dbContext.Set<SystemConfig>().Add(new SystemConfig()
			{
				Id = Guid.NewGuid(),
				OrganizationName = request.OrganizationName,
				BotName = request.BotName,
				HubUrl = request.HubUrl,
				Direction = request.Direction,
				Language = request.Language,
				ServiceBaseUrl = request.ServiceBaseUrl,
				BotFatherUrl = request.BotFatherUrl,
				BotHubUrl = request.BotHubUrl,
				PanelUrl = request.PanelUrl,
				OpenAIToken = request.OpenAIToken,
				AutoLeaveWaitingEnter = request.AutoLeaveWaitingEnter,
				AutoLeaveNoParticipant = request.AutoLeaveNoParticipant,
				AutoLeaveAllParticipantsLeft = request.AutoLeaveAllParticipantsLeft,
				MeetingVideoRecording = request.MeetingVideoRecording,
				MeetingAudioRecording = request.MeetingAudioRecording,
				MeetingTranscription = request.MeetingTranscription,
				MeetingTranscriptionModel = request.MeetingTranscriptionModel
			});
		}

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.System.FailedToConfig);
	}
}
