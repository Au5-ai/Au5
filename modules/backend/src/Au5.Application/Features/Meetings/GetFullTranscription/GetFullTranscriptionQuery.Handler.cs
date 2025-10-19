namespace Au5.Application.Features.Meetings.GetFullTranscription;

public class GetFullTranscriptionQueryHandler : IRequestHandler<GetFullTranscriptionQuery, Result<FullTranscriptionResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public GetFullTranscriptionQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<FullTranscriptionResponse>> Handle(GetFullTranscriptionQuery request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.Include(x => x.User)
			.Include(x => x.Guests)
			.Include(x => x.Participants)
				.ThenInclude(p => p.User)
			.Include(x => x.Entries)
				.ThenInclude(ent => ent.Reactions)
				.ThenInclude(rac => rac.Reaction)
			.Include(x => x.MeetingSpaces)
				.ThenInclude(m => m.Space)
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId && m.MeetId == request.MeetId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		var orderedEntries = meeting.Entries
			.OrderBy(e => e.Timestamp)
			.ToList();

		var baseTime = meeting.CreatedAt;

		var result = new FullTranscriptionResponse
		{
			Id = meeting.Id,
			Title = meeting.MeetName,
			MeetingId = meeting.MeetId,
			UserRecorder = meeting.User.ToParticipant(),
			Platform = meeting.Platform,
			BotName = meeting.BotName,
			IsBotAdded = meeting.IsBotAdded,
			CreatedAt = meeting.CreatedAt.ToString("o"),
			ClosedAt = meeting.ClosedAt.ToString("o"),
			Duration = meeting.Duration,
			Status = meeting.Status.ToString(),
			IsFavorite = meeting.IsFavorite,
			Spaces = meeting.MeetingSpaces?.Select(m => m.Space).ToList(),
			Participants = meeting.Participants
										.Select(p => p.User.ToParticipant())
										.ToList()
										.AsReadOnly(),
			Guests = meeting.Guests?.Select(g => g.ToParticipant())
									.ToList()
									.AsReadOnly(),
			Entries = orderedEntries.Select(entry => new EntryDto
			{
				BlockId = entry.BlockId,
				ParticipantId = entry.ParticipantId,
				FullName = entry.FullName ?? string.Empty,
				PictureUrl = string.Empty, // TODO: Add PictureUrl From Participant with Id entry.ParticipantId
				Content = entry.Content,
				Timestamp = entry.Timestamp.ToString("o"),
				Timeline = (entry.Timestamp - baseTime).ToString(@"hh\:mm\:ss"),
				EntryType = entry.EntryType,
				Reactions = entry.Reactions.Select(ar =>
					new ReactionDto
					{
						Id = ar.ReactionId,
						Participants = ar.Participants,
						Type = ar.Reaction.Type,
						Emoji = ar.Reaction.Emoji,
						ClassName = ar.Reaction.ClassName
					})
				.ToList()
				.AsReadOnly()
			})
			.ToList()
			.AsReadOnly()
		};

		return result;
	}
}
