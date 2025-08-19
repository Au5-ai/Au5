using Au5.Application.Features.Meetings.Events;

namespace Au5.Application.Features.Meetings.EndMeeting;

public class EndMeetingHandler : IRequestHandler<EndMeetingCommand, bool>
{
	private readonly IMeetingRepository _meetingRepository;
	private readonly IIntegrationEventPublisher _eventPublisher;

	public EndMeetingHandler(IMeetingRepository meetingRepository, IIntegrationEventPublisher eventPublisher)
	{
		_meetingRepository = meetingRepository;
		_eventPublisher = eventPublisher;
	}

	public async ValueTask<bool> Handle(EndMeetingCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _meetingRepository.GetMeetingAsync(request.MeetId, cancellationToken);
		if (meeting is null)
		{
			return false;
		}

		await _meetingRepository.EndMeetingAsync(request.MeetId, cancellationToken);

		var integrationEvent = new MeetingEndedIntegrationEvent(request.MeetId, DateTime.UtcNow);

		await _eventPublisher.PublishAsync(integrationEvent, cancellationToken);

		return true;
	}
}
