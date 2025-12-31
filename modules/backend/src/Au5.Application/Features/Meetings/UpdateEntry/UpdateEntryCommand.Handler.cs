namespace Au5.Application.Features.Meetings.UpdateEntry;

public class UpdateEntryCommandHandler(IApplicationDbContext dbContext) : IRequestHandler<UpdateEntryCommand, Result<UpdateEntryCommandResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;

	public async ValueTask<Result<UpdateEntryCommandResponse>> Handle(UpdateEntryCommand request, CancellationToken cancellationToken)
	{
		var entry = await _dbContext.Set<Entry>().FirstOrDefaultAsync(e => e.Id == request.EntryId && e.MeetingId == request.MeetingId, cancellationToken);

		if (entry is null)
		{
			return Error.NotFound("Entry.NotFound", "No entry with this ID was found in the meeting.");
		}

		if (entry.Content == request.Content)
		{
			return new UpdateEntryCommandResponse();
		}

		entry.Content = request.Content;
		var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);

		if (saveResult.IsFailure)
		{
			return Error.Failure("Entry.FailedToUpdate", "Failed to save changes. Please try again later.");
		}

		return new UpdateEntryCommandResponse();
	}
}
