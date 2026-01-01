namespace Au5.Application.Features.Meetings.DeleteEntry;

public class DeleteEntryCommandHandler(IApplicationDbContext dbContext) : IRequestHandler<DeleteEntryCommand, Result<DeleteEntryCommandResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;

	public async ValueTask<Result<DeleteEntryCommandResponse>> Handle(DeleteEntryCommand request, CancellationToken cancellationToken)
	{
		var entry = await _dbContext.Set<Entry>().FirstOrDefaultAsync(e => e.Id == request.EntryId && e.MeetingId == request.MeetingId, cancellationToken);

		if (entry is null)
		{
			return Error.NotFound("Entry.NotFound", "No entry with this ID was found in the meeting.");
		}

		_dbContext.Set<Entry>().Remove(entry);
		var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);

		if (saveResult.IsFailure)
		{
			return Error.Failure("Entry.FailedToDelete", "Failed to delete entry. Please try again later.");
		}

		return new DeleteEntryCommandResponse(true);
	}
}