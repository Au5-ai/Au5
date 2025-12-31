using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.AddParticipants;

public class AddParticipantCommandHandler : IRequestHandler<AddParticipantCommand, Result<IReadOnlyCollection<Participant>>>
{
	private readonly IApplicationDbContext _context;

	public AddParticipantCommandHandler(IApplicationDbContext dbContext)
	{
		_context = dbContext;
	}

	public async ValueTask<Result<IReadOnlyCollection<Participant>>> Handle(AddParticipantCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _context.Set<Meeting>()
			.FirstOrDefaultAsync(x => x.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound("Meeting.NotFound", AppResources.Meeting.NotFound);
		}

		var existingParticipantIds = await _context.Set<ParticipantInMeeting>()
			.Where(x => x.MeetingId == request.MeetingId && request.ParticipantsId.Contains(x.UserId))
			.Select(x => x.UserId)
			.ToListAsync(cancellationToken);

		var newParticipantIds = request.ParticipantsId.Except(existingParticipantIds).ToList();

		if (newParticipantIds.Count == 0)
		{
			return new List<Participant>();
		}

		var participants = newParticipantIds.Select(userId => new ParticipantInMeeting
		{
			UserId = userId,
			MeetingId = request.MeetingId
		}).ToList();

		_context.Set<ParticipantInMeeting>().AddRange(participants);
		var result = await _context.SaveChangesAsync(cancellationToken);

		if (result.IsFailure)
		{
			return Error.Failure("Participant.AddFailed", AppResources.Meeting.FailedToAddParticipant);
		}

		var addedUsers = await _context.Set<User>()
			.Where(u => newParticipantIds.Contains(u.Id))
			.Select(u => new Participant(u.Id, u.FullName, u.Email, u.PictureUrl))
			.ToListAsync(cancellationToken);

		return addedUsers;
	}
}
