using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.MyMeeting;

public class MyMeetingQueryHandler : IRequestHandler<MyMeetingQuery, Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>>
{
	private readonly IApplicationDbContext _dbContext;

	public MyMeetingQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>> Handle(MyMeetingQuery request, CancellationToken cancellationToken)
	{
		var query = _dbContext.Set<Meeting>()
		.Include(x => x.Guests)
		.Include(x => x.Participants)
			.ThenInclude(x => x.User)
		.AsNoTracking()
		.Where(x => x.Participants.Any(p => p.UserId == request.UserId));

		query = request.Status == MeetingStatus.Archived
			? query.Where(x => x.Status == MeetingStatus.Archived)
			: query.Where(x => x.Status != MeetingStatus.Archived);

		var meetings = await query.OrderByDescending(x => x.CreatedAt)
		.Select(x => new
		{
			x.Id,
			x.MeetId,
			x.MeetName,
			x.Platform,
			x.BotName,
			Status = x.Status.ToString(),
			Date = x.CreatedAt.ToString("dddd, MMMM dd"),
			Time = x.CreatedAt.ToString("h:mm tt"),
			Duration = string.IsNullOrEmpty(x.Duration) ? "0m" : x.Duration,
			Participants = x.Guests
				.Select(g => g.FullName)
				.Concat(x.Participants.Select(p => p.User.FullName))
				.Distinct()
				.ToList(),
			x.Participants.FirstOrDefault().User.PictureUrl
		})
		.ToListAsync(cancellationToken);

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
				Participants = m.Participants,
				PictureUrl = m.PictureUrl
			}).ToList()
		}).ToList();

		return result;
	}
}
