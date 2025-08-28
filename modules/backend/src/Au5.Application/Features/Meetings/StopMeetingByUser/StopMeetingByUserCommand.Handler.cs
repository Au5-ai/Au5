using Au5.Application.Common.Abstractions;
using Au5.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.StopMeetingByUser;

public class StopMeetingByUserCommandHandler : IRequestHandler<StopMeetingByUserCommand, Result<bool>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IMeetingService _meetingService;

	public StopMeetingByUserCommandHandler(IApplicationDbContext dbContext, IMeetingService meetingService)
	{
		_meetingService = meetingService;
		_dbContext = dbContext;
	}

	public async ValueTask<Result<bool>> Handle(StopMeetingByUserCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.FirstOrDefaultAsync(x => x.Id == request.MeetingId);

		if (meeting is null)
		{
			return Error.BadRequest(description: "Meeting not found");
		}

		var meetingContent = await _meetingService.StopMeeting(MeetingService.GetMeetingKey(request.MeetId), cancellationToken);

		if (meetingContent is not null)
		{
			_dbContext.Set<Meeting>().Add(meetingContent);
			var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
			return dbResult.IsSuccess
				? true
				: Error.Failure(description: "Failed to stop meeting");
		}

		return Error.Failure(description: "There is No Meeting Content");
	}
}
