namespace Au5.Application.Features.Meetings.AddBot;

public record AddBotRequest(string Platform, string BotName, string MeetId) : IRequest<Result<Guid>>;
