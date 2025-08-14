using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.MyMeeting;

public class MyMeetingQueryHandler : IRequestHandler<MyMeetingQuery, Result<IReadOnlyCollection<MyMeetingResponse>>>
{
	private readonly IApplicationDbContext _dbContext;

	public MyMeetingQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<IReadOnlyCollection<MyMeetingResponse>>> Handle(MyMeetingQuery request, CancellationToken cancellationToken)
	{
		var meetings = await _dbContext.Set<Meeting>()
			.Include(x => x.Guests)
			.Include(x => x.Participants)
			.ThenInclude(x => x.User)
			.AsNoTracking()
			.Where(x => x.Participants.Any(p => p.UserId == request.UserId))
			.Where(x => x.Status == MeetingStatus.Ended || x.Status == MeetingStatus.AddingBot)
			.OrderByDescending(x => x.CreatedAt)
			.Select(x => new MyMeetingResponse(
				x.Id,
				x.MeetId,
				x.MeetName,
				x.Platform,
				x.BotName,
				x.CreatedAt.ToString("yyyy-MM-dd"),
				x.CreatedAt.ToString("HH:mm:ss"),
				x.Status.ToString(),
				string.IsNullOrEmpty(x.Duration) ? "0h 0m" : x.Duration,
				x.Participants.Select(p => p.User.ToParticipant()).ToList()))
			.ToListAsync(cancellationToken);
		return meetings;
	}
}
