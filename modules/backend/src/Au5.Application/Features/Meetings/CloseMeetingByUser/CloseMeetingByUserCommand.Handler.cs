using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.CloseMeetingByUser;

public class CloseMeetingByUserCommandHandler : IRequestHandler<CloseMeetingByUserCommand, Result<bool>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IMeetingService _meetingService;

	public CloseMeetingByUserCommandHandler(IApplicationDbContext dbContext, IMeetingService meetingService)
	{
		_meetingService = meetingService;
		_dbContext = dbContext;
	}

	public async ValueTask<Result<bool>> Handle(CloseMeetingByUserCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.FirstOrDefaultAsync(x => x.Id == request.MeetingId && x.MeetId == request.MeetId && x.Status != MeetingStatus.Ended, cancellationToken: cancellationToken);

		if (meeting is null)
		{
			return Error.BadRequest(description: "Meeting not found");
		}

		var meetingContent = await _meetingService.CloseMeeting(request.MeetId, cancellationToken);

		if (meetingContent is not null)
		{
			meeting.Status = MeetingStatus.Ended;
			meeting.Duration = meeting.CreatedAt.DiffTo(DateTime.Now).ToReadableString();
			meeting.ClosedAt = DateTime.Now;
			meeting.Entries = meetingContent.Entries; // TODO: Calculate Timeline in each entry
			meeting.Participants = meetingContent.Participants;
			meeting.Guests = meetingContent.Guests;
			meeting.ClosedMeetingUserId = request.UserId;

			var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

			return dbResult.IsSuccess
				? true
				: Error.Failure(description: "Failed to close meeting");
		}

		return Error.Failure(description: "There is No Meeting Content");
	}
}
