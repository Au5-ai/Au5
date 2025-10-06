namespace Au5.Application.Features.Meetings.ToggleFavorite;

public record ToggleFavoriteCommand(Guid MeetingId, string MeetId) : IRequest<Result<ToggleFavoriteResponse>>;
