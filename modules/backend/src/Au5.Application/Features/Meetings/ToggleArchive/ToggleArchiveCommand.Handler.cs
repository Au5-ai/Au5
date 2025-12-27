using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.ToggleArchive;

public class ToggleArchiveCommandHandler : IRequestHandler<ToggleArchiveCommand, Result<ToggleArchiveResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public ToggleArchiveCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<ToggleArchiveResponse>> Handle(ToggleArchiveCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.Include(x => x.Participants)
			.FirstOrDefaultAsync(x => x.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound("Meeting.NotFound", AppResources.Meeting.NotFound);
		}

		var participant = meeting.Participants.FirstOrDefault(p => p.UserId == _currentUserService.UserId);

		if (participant is null)
		{
			return Error.Forbidden("Meeting.NotParticipant", AppResources.Meeting.UnauthorizedToModify);
		}

		if (meeting.Status != MeetingStatus.Ended)
		{
			return Error.BadRequest("Meeting.AlreadyActive", AppResources.Meeting.CannotArchiveActiveMeeting);
		}

		participant.IsArchived = !participant.IsArchived;

		var result = await _dbContext.SaveChangesAsync(cancellationToken);
		return result.IsFailure
			? Error.Failure("Meeting.FailedToUpdate", AppResources.Meeting.FailedToToggleArchive)
			: new ToggleArchiveResponse(participant.IsArchived);
	}
}
