using Au5.Application.Common.Abstractions;

namespace Au5.Application.Features.Meetings.AddBot;

public record AddBotCommand(string Platform, string BotName, string MeetId) : BaseUserCommand<Result>;
