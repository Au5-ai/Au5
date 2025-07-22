using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.GetFullTranscription;

public class GetFullTranscriptionHandler : IRequestHandler<GetFullTranscriptionQuery, Result<FullTranscriptionResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public GetFullTranscriptionHandler(IApplicationDbContext dbContext)
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
			.FirstOrDefaultAsync(m => m.MeetId == request.MeetId, cancellationToken);

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
			BotInviterUser: new Participant() { Id = meeting.BotInviterUserId },
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
					pictureUrl: p.PictureUrl ?? string.Empty,
					hasAccount: p.UserId != Guid.Empty))
				.ToList()
				.AsReadOnly(),
			Entries: orderedEntries
				.Select(entry => new EntryDto(
					blockId: entry.BlockId,
					participantId: entry.ParticipantId,
					fullName: entry.FullName ?? string.Empty,
					content: entry.Content,
					timestamp: entry.Timestamp.ToString("o"),
					timeline: (entry.Timestamp - baseTime).ToString(@"hh\:mm\:ss"),
					entryType: entry.EntryType,
					reactions: entry.Reactions.Select(ar =>
						  new ReactionDto(
							  Id: ar.ReactionId,
							  Users: ar.Users,
							  Type: ar.Reaction.Type,
							  Emoji: ar.Reaction.Emoji)).ToList().AsReadOnly()))
				.ToList()
				.AsReadOnly());

		return result;
	}
}
