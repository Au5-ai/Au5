namespace Au5.Application.Features.Meetings.RemoveMeeting;

public record RemoveMeetingCommand(Guid MeetingId) : IRequest<Result<RemoveMeetingResponse>>;

public record class RemoveMeetingResponse
{
	public bool IsRemoved { get; init; }
}
