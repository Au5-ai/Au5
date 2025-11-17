using Au5.Application.Common;
using Au5.Application.Common.Options;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Meetings.CloseMeetingByUser;

public class CloseMeetingByUserCommandHandler : IRequestHandler<CloseMeetingByUserCommand, Result<bool>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IMeetingService _meetingService;
	private readonly IBotFatherAdapter _botFather;
	private readonly ICurrentUserService _currentUserService;
	private readonly IDataProvider _dataProvider;
	private readonly OrganizationOptions _organizationOptions;

	public CloseMeetingByUserCommandHandler(
		IApplicationDbContext dbContext,
		IMeetingService meetingService,
		IBotFatherAdapter botFather,
		ICurrentUserService currentUserService,
		IDataProvider dataProvider,
		IOptions<OrganizationOptions> options)
	{
		_meetingService = meetingService;
		_dbContext = dbContext;
		_botFather = botFather;
		_currentUserService = currentUserService;
		_dataProvider = dataProvider;
		_organizationOptions = options.Value;
	}

	public async ValueTask<Result<bool>> Handle(CloseMeetingByUserCommand request, CancellationToken cancellationToken)
	{
		var config = await _dbContext.Set<Organization>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		var meeting = await _dbContext.Set<Meeting>()
		.FirstOrDefaultAsync(x => x.Id == request.MeetingId && x.Status != MeetingStatus.Ended, cancellationToken: cancellationToken);

		if (meeting is null)
		{
			return Error.BadRequest(description: AppResources.Meeting.NotFound);
		}

		var meetingContent = await _meetingService.CloseMeeting(meeting.MeetId, cancellationToken);

		if (meetingContent is not null)
		{
			meeting.Status = MeetingStatus.Ended;
			meeting.Duration = meeting.CreatedAt.DiffTo(_dataProvider.Now).ToReadableString();
			meeting.ClosedAt = _dataProvider.Now;
			meeting.Entries = meetingContent.Entries;
			meeting.Participants = meetingContent.Participants;
			meeting.Guests = meetingContent.Guests;
			meeting.ClosedMeetingUserId = _currentUserService.UserId;

			var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

			if (dbResult.IsSuccess)
			{
				await _botFather.RemoveBotContainerAsync(_organizationOptions.BotFatherUrl, meeting.MeetId, meeting.HashToken, cancellationToken);
			}

			return dbResult.IsSuccess
				? true
				: Error.Failure(description: AppResources.Meeting.FailedToClose);
		}

		return Error.Failure(description: AppResources.Meeting.NoContent);
	}
}
