namespace Au5.Application.Features.Meetings.MyMeeting;

public class MyMeetingQueryHandler : IRequestHandler<MyMeetingQuery, Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public MyMeetingQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>> Handle(MyMeetingQuery request, CancellationToken cancellationToken)
	{
		var query = _dbContext.Set<Meeting>()
		.Include(x => x.Guests)
		.Include(x => x.Participants)
			.ThenInclude(x => x.User)
		.AsNoTracking()
		.Where(x => x.Participants.Any(p => p.UserId == _currentUserService.UserId));

		query = request.Status == MeetingStatus.Archived
			? query.Where(x => x.Status == MeetingStatus.Archived && x.Status != MeetingStatus.Deleted)
			: query.Where(x => x.Status != MeetingStatus.Archived && x.Status != MeetingStatus.Deleted);

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
				x.BotInviterUserId,
				Participants = x.Participants.Select(p => new Participant()
				{
					FullName = p.User.FullName,
					PictureUrl = p.User.PictureUrl,
					Email = p.User.Email,
					Id = p.UserId
				}).ToList()
			})
			.ToListAsync(cancellationToken);

		var meetings = meetingsRaw
			.Select(x => new
			{
				x.Id,
				x.MeetId,
				x.MeetName,
				x.Platform,
				x.BotName,
				x.Status,
				Date = x.Date.ToString("dddd, MMMM dd"),
				Time = x.Date.ToString("h:mm tt"),
				x.Duration,
				x.IsFavorite,
				x.Guests,
				x.Participants,
				PictureUrl = x.Participants.FirstOrDefault(p => p.Id == x.BotInviterUserId)?.PictureUrl ?? string.Empty
			})
			.ToList();

		var result = meetings
		.GroupBy(m => m.Date)
		.Select(g => new MyMeetingsGroupedResponse()
		{
			Date = g.Key,
			Items = g.Select(m => new MyMeetingItem()
			{
				MeetId = m.MeetId,
				MeetingId = m.Id,
				MeetName = m.MeetName,
				Platform = m.Platform,
				BotName = m.BotName,
				Duration = m.Duration,
				Time = m.Time,
				Status = m.Status,
				IsFavorite = m.IsFavorite,
				Guests = m.Guests,
				Participants = m.Participants,
				PictureUrl = m.PictureUrl
			}).ToList()
		}).ToList();

		return result;
	}
}
