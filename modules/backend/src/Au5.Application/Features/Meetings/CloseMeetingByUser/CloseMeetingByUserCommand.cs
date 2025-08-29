using Au5.Application.Common.Abstractions;

namespace Au5.Application.Features.Meetings.CloseMeetingByUser;

public record CloseMeetingByUserCommand(Guid MeetingId, string MeetId) : BaseUserCommand<Result<bool>>;
