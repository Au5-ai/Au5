using Au5.Application.Features.Meetings.MyMeeting;

namespace Au5.Application.Features.Spaces.GetSpaceMeetings;

public class GetSpaceMeetingsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
	: IRequestHandler<SpaceMeetingsQuery, Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>>
{
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>> Handle(SpaceMeetingsQuery request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;

		var userHasAccess = await context.Set<UserSpace>()
			.AnyAsync(us => us.UserId == currentUserId && us.SpaceId == request.SpaceId, cancellationToken);

		if (!userHasAccess)
		{
			return Error.Failure("Space.Access.Denied", "You do not have access to this space");
		}

		var query = context.Set<MeetingSpace>()
		.Where(ms => ms.SpaceId == request.SpaceId)
		.Include(ms => ms.Meeting)
			.ThenInclude(m => m.Participants)
				.ThenInclude(p => p.User)
		.Include(ms => ms.Meeting)
			.ThenInclude(m => m.Guests);

		var meetingsRaw = await query
			.OrderByDescending(x => x.CreatedAt)
			.Select(x => new
			{
				x.Meeting.Id,
				x.Meeting.MeetId,
				x.Meeting.MeetName,
				x.Meeting.Platform,
				x.Meeting.BotName,
				Status = x.Meeting.Status.ToString(),
				Date = x.CreatedAt,
				Duration = string.IsNullOrEmpty(x.Meeting.Duration) ? "0m" : x.Meeting.Duration,
				x.Meeting.IsFavorite,
				Guests = x.Meeting.Guests.Select(g => g.FullName).ToList(),
				Participants = x.Meeting.Participants.Select(p => new Participant()
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
				x.Participants.FirstOrDefault()?.PictureUrl
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
