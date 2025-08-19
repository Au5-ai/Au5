using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Meetings.Events;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Mediator;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Events.Handlers;

public class MeetingEndedIntegrationEventHandler
	: INotificationHandler<MeetingEndedIntegrationEvent>
{
	private readonly IMeetingRepository _meetingRepository;
	private readonly IApplicationDbContext _dbContext;
	private readonly ILogger<MeetingEndedIntegrationEventHandler> _logger;

	public MeetingEndedIntegrationEventHandler(
		IMeetingRepository meetingRepository,
		IApplicationDbContext dbContext,
		ILogger<MeetingEndedIntegrationEventHandler> logger)
	{
		_meetingRepository = meetingRepository;
		_dbContext = dbContext;
		_logger = logger;
	}

	public async ValueTask Handle(MeetingEndedIntegrationEvent notification, CancellationToken cancellationToken)
	{
		_logger.LogInformation(
			"Processing ended meeting {MeetId} at {EndedAt}",
			notification.MeetId,
			notification.EndedAt);

		var meeting = await _meetingRepository.GetMeetingAsync(notification.MeetId, cancellationToken);

		if (meeting is null)
		{
			_logger.LogWarning("Meeting {MeetId} not found in repository.", notification.MeetId);
			return;
		}

		meeting.Status = MeetingStatus.Ended;

		_dbContext.Set<Meeting>().Add(meeting);
		var result = await _dbContext.SaveChangesAsync(cancellationToken);

		if (result.IsSuccess)
		{
			_logger.LogInformation("Meeting {MeetId} successfully persisted to SQL.", notification.MeetId);

			await _meetingRepository.RemoveMeetingAsync(notification.MeetId, cancellationToken);
		}
		else
		{
			_logger.LogError("Failed to persist meeting {MeetId} to SQL.", notification.MeetId);
		}
	}
}
