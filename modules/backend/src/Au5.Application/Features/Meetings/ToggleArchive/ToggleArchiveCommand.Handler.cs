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
			.FirstOrDefaultAsync(x => x.Id == request.MeetingId && x.MeetId == request.MeetId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: AppResources.Meeting.NotFound);
		}

		var isParticipant = meeting.Participants.Any(p => p.UserId == _currentUserService.UserId);
		if (!isParticipant)
		{
			return Error.Forbidden(description: AppResources.Meeting.UnauthorizedToModify);
		}

		if (meeting.Status == MeetingStatus.Archived)
		{
			meeting.Status = MeetingStatus.Ended;
		}
		else
		{
			if (meeting.Status != MeetingStatus.Ended)
			{
				return Error.BadRequest(description: AppResources.Meeting.CannotArchiveActiveMeeting);
			}

			meeting.Status = MeetingStatus.Archived;
		}

		var result = await _dbContext.SaveChangesAsync(cancellationToken);
		return result.IsFailure
			? Error.Failure(description: AppResources.Meeting.FailedToToggleArchive)
			: new ToggleArchiveResponse(meeting.Status == MeetingStatus.Archived);
	}
}
