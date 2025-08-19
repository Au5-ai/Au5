namespace Au5.Application.Features.Meetings.InsertBlock;

public class InsertBlockHandler : IRequestHandler<InsertBlockCommand>
{
	private readonly IMeetingRepository _repo;

	public InsertBlockHandler(IMeetingRepository repo) => _repo = repo;

	public async ValueTask<Unit> Handle(InsertBlockCommand request, CancellationToken cancellationToken)
	{
		var entry = new Entry
		{
			BlockId = request.Entry.BlockId,
			Content = request.Entry.Content,
			ParticipantId = request.Entry.Participant.Id,
			FullName = request.Entry.Participant.FullName,
			Timestamp = request.Entry.Timestamp,
			EntryType = request.Entry.EntryType,
			Reactions = []
		};

		await _repo.AddEntryAsync(request.Entry.MeetId, entry, cancellationToken);
		return Unit.Value;
	}
}
