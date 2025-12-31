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
		var result = await _dbContext.Set<Meeting>()
			.AsNoTracking()
			.Where(m => m.Id == request.MeetingId)
			.Select(meeting => new FullTranscriptionResponse
			{
				Id = meeting.Id,
				Title = meeting.MeetName,
				MeetingId = meeting.MeetId,
				UserRecorder = new Participant
				{
					Id = meeting.User.Id,
					FullName = meeting.User.FullName,
					PictureUrl = meeting.User.PictureUrl,
					Email = meeting.User.Email
				},
				Platform = meeting.Platform,
				BotName = meeting.BotName,
				IsBotAdded = meeting.IsBotAdded,
				CreatedAt = meeting.CreatedAt.ToString("o"),
				ClosedAt = meeting.ClosedAt.ToString("o"),
				Duration = meeting.Duration,
				Status = meeting.Status.ToString(),
				IsFavorite = meeting.IsFavorite,
				Spaces = meeting.MeetingSpaces
					.Select(m => new SpaceDto
					{
						Id = m.SpaceId,
						Name = m.Space.Name,
						Description = m.Space.Description
					})
					.ToList(),
				Participants = meeting.Participants
					.Select(p => new Participant
					{
						Id = p.User.Id,
						FullName = p.User.FullName,
						PictureUrl = p.User.PictureUrl,
						Email = p.User.Email
					})
					.ToList()
					.AsReadOnly(),
				Guests = meeting.Guests
					.Select(g => new Participant
					{
						FullName = g.FullName,
						PictureUrl = g.PictureUrl
					})
					.ToList()
					.AsReadOnly(),
				Entries = meeting.Entries
					.OrderBy(e => e.Timestamp)
					.Select(entry => new EntryDto
					{
						Id = entry.Id,
						BlockId = entry.BlockId,
						ParticipantId = entry.ParticipantId,
						FullName = entry.FullName ?? string.Empty,
						Content = entry.Content,
						Time = entry.Timestamp.ToString("HH:mm"),
						Timeline = entry.Timeline,
						EntryType = entry.EntryType,
						Reactions = entry.Reactions
							.Select(ar => new ReactionDto
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
			})
			.FirstOrDefaultAsync(cancellationToken);

		if (result is null)
		{
			return Error.NotFound("Meeting.NotFound", "No meeting with this ID was found.");
		}

		return result;
	}
}
