namespace Au5.Application.Features.Meetings.AddBot;

public record AddBotCommand(string Platform, string BotName, string MeetId) : BaseUserCommand<Result<AddBotCommandResponse>>;
public record AddBotCommandResponse(Guid MeetingId);
