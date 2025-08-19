namespace Au5.Application.Features.Meetings.UpsertBlock;

public class UpsertBlockHandler : IRequestHandler<UpsertBlockCommand, bool>
{
	private readonly IMeetingRepository _repo;

	public UpsertBlockHandler(IMeetingRepository repo) => _repo = repo;

	public async ValueTask<bool> Handle(UpsertBlockCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _repo.GetMeetingAsync(request.Entry.MeetId, cancellationToken);
		if (meeting.IsPaused())
		{
			return false;
		}

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

		await _repo.UpdateEntryAsync(request.Entry.MeetId, entry, cancellationToken);
		return true;
	}
}
