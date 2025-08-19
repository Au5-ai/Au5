namespace Au5.Application.Features.Meetings.AddUserToMeeting;

public record AddUserToMeetingCommand(UserJoinedInMeetingMessage UserJoined) : IRequest<Meeting>;
