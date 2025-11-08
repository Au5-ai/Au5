namespace Au5.Application.Features.Meetings.Rename;

public class RenameMeetingCommandHandler(IApplicationDbContext _dbContext) : IRequestHandler<RenameMeetingCommand, Result<RenameMeetingCommandResponse>>
{
	public async ValueTask<Result<RenameMeetingCommandResponse>> Handle(RenameMeetingCommand request, CancellationToken cancellationToken)
	{
		var currentMeet = await _dbContext.Set<Meeting>().FirstOrDefaultAsync(s => s.MeetId == request.meetingId);

		if (currentMeet is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		if(request.newTitle != currentMeet.MeetName)
		{
			currentMeet.MeetName = request.newTitle;
			var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);
			if (saveResult.IsFailure)
			{
				return Error.Failure("Failed to save changes. Please try again later.");
			}
		}

		return new RenameMeetingCommandResponse();
	}
}
