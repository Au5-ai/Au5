namespace Au5.Application.Features.Meetings.EndMeeting;

public record EndMeetingCommand(string MeetId) : IRequest<bool>;
