namespace Au5.Application.Features.Meetings.ToggleFavorite;

public record ToggleFavoriteCommand(Guid MeetingId) : IRequest<Result<ToggleFavoriteResponse>>;
