namespace Au5.Application.Features.Meetings.Rename;

public class RenameMeetingCommandHandler : IRequestHandler<RenameMeetingCommand, Result<RenameMeetingCommandResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public RenameMeetingCommandHandler(
		IApplicationDbContext context)
	{
		_dbContext = context;
	}

	public async ValueTask<Result<RenameMeetingCommandResponse>> Handle(RenameMeetingCommand request, CancellationToken cancellationToken)
	{
		RenameMeetingCommandValidator validator = new ();
		var validationResult = validator.Validate(request);
		if (!validationResult.IsValid)
		{
			return Error.Validation(description: string.Join(", ", validationResult.Errors));
		}

		var currentMeet = await _dbContext.Set<Meeting>().FirstOrDefaultAsync(s => s.MeetId == request.meetingId);

		if (currentMeet is null)
		{
			return Error.NotFound();
		}

		if(request.newTitle != currentMeet.MeetName)
		{
			currentMeet.MeetName = request.newTitle;
			var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);
			if (saveResult.IsFailure)
			{
				return saveResult.Error;
			}
		}

		return new RenameMeetingCommandResponse();
	}
}
