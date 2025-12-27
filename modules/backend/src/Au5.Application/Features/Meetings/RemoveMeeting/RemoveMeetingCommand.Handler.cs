using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.RemoveMeeting;

public class RemoveMeetingCommandHandler : IRequestHandler<RemoveMeetingCommand, Result<RemoveMeetingResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public RemoveMeetingCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<RemoveMeetingResponse>> Handle(RemoveMeetingCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>().FirstOrDefaultAsync(m => m.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.BadRequest("Meeting.NotFound", AppResources.Meeting.NotFound);
		}

		meeting.Status = MeetingStatus.Deleted;
		var result = await _dbContext.SaveChangesAsync(cancellationToken);
		return result.IsSuccess
			? new RemoveMeetingResponse() { IsRemoved = true }
			: Error.Failure("Meeting.RemoveFailed", AppResources.Meeting.FailedToRemove);
	}
}
