using Au5.Application.Common.Abstractions;

namespace Au5.Application.Features.Meetings.MyMeeting;

public record MyMeetingQuery() : BaseUserCommand<Result<IReadOnlyCollection<MyMeetingResponse>>>;

public record class MyMeetingResponse(
	Guid MeetingId,
	string MeetId,
	string MeetName,
	string Platform,
	string BotName,
	string CreatedAtDate,
	string CreatedAtTime,
	string Status,
	string Duration,
	IReadOnlyList<Participant> Guests,
	IReadOnlyList<Participant> Participants
);
