namespace Au5.Application.Features.Meetings.Rename;

public class RenameMeetingCommandHandler(IApplicationDbContext dbContext) : IRequestHandler<RenameMeetingCommand, Result<RenameMeetingCommandResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;

	public async ValueTask<Result<RenameMeetingCommandResponse>> Handle(RenameMeetingCommand request, CancellationToken cancellationToken)
	{
		var currentMeet = await _dbContext.Set<Meeting>()
			.FirstOrDefaultAsync(s => s.Id == request.MeetingId, cancellationToken);

		if (currentMeet is null)
		{
			return Error.NotFound("Meeting.NotFound", "No meeting with this ID was found.");
		}

		if (request.NewTitle != currentMeet.MeetName)
		{
			currentMeet.MeetName = request.NewTitle;
			var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);
			if (saveResult.IsFailure)
			{
				return Error.Failure("Meeting.FailedToUpdate", "Failed to save changes. Please try again later.");
			}
		}

		return new RenameMeetingCommandResponse();
	}
}
