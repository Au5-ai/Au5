namespace Au5.Application.Features.Meetings.ToggleArchive;

public record ToggleArchiveCommand(Guid MeetingId) : IRequest<Result<ToggleArchiveResponse>>;