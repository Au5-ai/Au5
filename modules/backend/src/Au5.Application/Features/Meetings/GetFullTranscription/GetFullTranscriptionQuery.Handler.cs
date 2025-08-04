using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

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
			.Include(x => x.Participants)
			.Include(x => x.Entries)
			.ThenInclude(ent => ent.Reactions)
			.ThenInclude(rac => rac.Reaction)
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId && m.MeetId == request.MeetId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		var orderedEntries = meeting.Entries
			.OrderBy(e => e.Timestamp)
			.ToList();

		var baseTime = meeting.CreatedAt;

		var result = new FullTranscriptionResponse(
			Id: meeting.Id,
			MeetingId: meeting.MeetId,
			BotInviterUser: meeting.User.ToParticipant(),
			HashToken: meeting.HashToken,
			Platform: meeting.Platform,
			BotName: meeting.BotName,
			IsBotAdded: meeting.IsBotAdded,
			CreatedAt: meeting.CreatedAt.ToString("o"),
			Status: meeting.Status.ToString(),
			Participants: meeting.Participants
				.Select(p => new Participant(
					id: p.UserId,
					fullName: p.FullName ?? string.Empty,
					email: string.Empty,
					pictureUrl: p.PictureUrl ?? string.Empty,
					hasAccount: p.UserId != Guid.Empty))
				.ToList()
				.AsReadOnly(),
			Entries: orderedEntries
				.Select(entry => new EntryDto(
					BlockId: entry.BlockId,
					ParticipantId: entry.ParticipantId,
					FullName: entry.FullName ?? string.Empty,
					Content: entry.Content,
					Timestamp: entry.Timestamp.ToString("o"),
					Timeline: (entry.Timestamp - baseTime).ToString(@"hh\:mm\:ss"),
					EntryType: entry.EntryType,
					Reactions: entry.Reactions.Select(ar =>
						  new ReactionDto(
							  Id: ar.ReactionId,
							  Participants: ar.Participants,
							  Type: ar.Reaction.Type,
							  Emoji: ar.Reaction.Emoji)).ToList().AsReadOnly()))
				.ToList()
				.AsReadOnly());

		return result;
	}
}
