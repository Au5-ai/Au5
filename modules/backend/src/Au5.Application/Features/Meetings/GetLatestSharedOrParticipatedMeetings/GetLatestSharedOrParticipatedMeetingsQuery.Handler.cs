namespace Au5.Application.Features.Meetings.GetLatestSharedOrParticipatedMeetings;

public class GetLatestSharedOrParticipatedMeetingsQueryHandler : IRequestHandler<GetLatestSharedOrParticipatedMeetingsQuery, Result<IReadOnlyCollection<LatestMeetingResponse>>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public GetLatestSharedOrParticipatedMeetingsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<IReadOnlyCollection<LatestMeetingResponse>>> Handle(GetLatestSharedOrParticipatedMeetingsQuery request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;

		var userSpaceIds = await _dbContext.Set<UserSpace>()
			.Where(us => us.UserId == currentUserId)
			.Select(us => us.SpaceId)
			.ToListAsync(cancellationToken);

		var query = _dbContext.Set<Meeting>()
			.AsNoTracking()
			.Include(x => x.Guests)
			.Include(x => x.Participants).ThenInclude(p => p.User)
			.Where(x => x.Status != MeetingStatus.Archived)
			.Where(x =>
				x.Participants.Any(p => p.UserId == currentUserId) ||
				x.MeetingSpaces.Any(ms => userSpaceIds.Contains(ms.SpaceId)));

		var meetingsRaw = await query
			.OrderByDescending(x => x.CreatedAt)
			.Select(x => new
			{
				x.Id,
				x.MeetId,
				x.MeetName,
				x.Platform,
				x.BotName,
				Status = x.Status.ToString(),
				Date = x.CreatedAt,
				Duration = string.IsNullOrEmpty(x.Duration) ? "0m" : x.Duration,
				x.IsFavorite,
				Guests = x.Guests.Select(g => g.FullName).ToList(),
				Participants = x.Participants.Select(p => new Participant()
				{
					FullName = p.User.FullName,
					PictureUrl = p.User.PictureUrl,
					Email = p.User.Email,
					Id = p.UserId
				}).ToList()
			})
			.ToListAsync(cancellationToken);

		var result = meetingsRaw
			.Select(x => new LatestMeetingResponse
			{
				MeetingId = x.Id,
				MeetId = x.MeetId,
				MeetName = x.MeetName,
				Platform = x.Platform,
				BotName = x.BotName,
				Status = x.Status,
				Duration = x.Duration,
				CreatedAt = x.Date.ToString("dddd, MMMM dd"),
				Time = x.Date.ToString("h:mm tt"),
				IsFavorite = x.IsFavorite,
				Guests = x.Guests,
				Participants = x.Participants,
				PictureUrl = x.Participants.FirstOrDefault()?.PictureUrl ?? string.Empty
			})
			.ToList()
			.AsReadOnly();

		return result;
	}
}
