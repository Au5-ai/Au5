namespace Au5.Application.Features.Meetings.AddBot;

public record AddBotCommand(string Platform, string MeetId) : IRequest<Result<AddBotCommandResponse>>;
public record AddBotCommandResponse(Guid MeetingId);
