namespace Au5.Application.Features.Meetings.ToggleFavorite;

public class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, Result<ToggleFavoriteResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public ToggleFavoriteCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<ToggleFavoriteResponse>> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.Include(x => x.Participants)
			.FirstOrDefaultAsync(x => x.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "Meeting not found");
		}

		// Check if the current user is a participant in the meeting
		var isParticipant = meeting.Participants.Any(p => p.UserId == _currentUserService.UserId);
		if (!isParticipant)
		{
			return Error.Forbidden(description: "You are not authorized to modify this meeting");
		}

		// Toggle the favorite status
		meeting.IsFavorite = !meeting.IsFavorite;

		var result = await _dbContext.SaveChangesAsync(cancellationToken);
		return result.IsFailure
			? Error.Failure(description: "Failed to update favorite status")
			: new ToggleFavoriteResponse(meeting.IsFavorite);
	}
}
