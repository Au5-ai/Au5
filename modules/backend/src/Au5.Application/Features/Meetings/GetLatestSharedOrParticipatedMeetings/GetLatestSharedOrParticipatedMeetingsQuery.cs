namespace Au5.Application.Features.Meetings.GetLatestSharedOrParticipatedMeetings;

public record GetLatestSharedOrParticipatedMeetingsQuery() : IRequest<Result<IReadOnlyCollection<LatestMeetingResponse>>>;

public record class LatestMeetingResponse
{
	public Guid MeetingId { get; init; }
	public string MeetId { get; init; }
	public string MeetName { get; init; }
	public string Platform { get; init; }
	public string BotName { get; init; }
	public string Status { get; init; }
	public string Duration { get; init; }
	public string CreatedAt { get; init; }
	public string Time { get; init; }
	public bool IsFavorite { get; init; }
	public string PictureUrl { get; init; }
	public IReadOnlyList<string> Guests { get; init; }
	public IReadOnlyList<Participant> Participants { get; init; }
}