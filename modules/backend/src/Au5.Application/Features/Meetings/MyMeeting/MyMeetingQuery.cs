namespace Au5.Application.Features.Meetings.MyMeeting;

public record MyMeetingQuery(MeetingStatus Status) : IRequest<Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>>;

public record class MyMeetingsGroupedResponse
{
	public string Date { get; init; }
	public IReadOnlyList<MyMeetingItem> Items { get; init; }
}

public record class MyMeetingItem
{
	public Guid MeetingId { get; init; }
	public string MeetId { get; init; }
	public string MeetName { get; init; }
	public string Platform { get; init; }
	public string BotName { get; init; }
	public string Status { get; init; }
	public string Duration { get; init; }
	public string Time { get; init; }
	public bool IsFavorite { get; init; }
	public string PictureUrl { get; init; }
	public IReadOnlyList<string> Guests { get; init; }
	public IReadOnlyList<Participant> Participants { get; init; }
}
