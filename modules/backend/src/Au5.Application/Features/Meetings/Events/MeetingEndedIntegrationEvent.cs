namespace Au5.Application.Features.Meetings.Events;

public class MeetingEndedIntegrationEvent : INotification
{
	public MeetingEndedIntegrationEvent(string meetId, DateTime endedAt)
	{
		MeetId = meetId;
		EndedAt = endedAt;
	}

	public string MeetId { get; }

	public DateTime EndedAt { get; }
}
