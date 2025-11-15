namespace Au5.Application.Features.Meetings.GetSystemMeetingUrl;

public class GetMeetingUrlCommandHandler(
		IMeetingUrlService meetingUrlService,
		IApplicationDbContext dbContext,
		IDataProvider dataProvider) : IRequestHandler<GetMeetingUrlCommand, Result<GetMeetingUrlResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly IMeetingUrlService _meetingUrlService = meetingUrlService;
	private readonly IDataProvider _dataProvider = dataProvider;

	public async ValueTask<Result<GetMeetingUrlResponse>> Handle(GetMeetingUrlCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>().FirstOrDefaultAsync(s => s.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		var existingConfig = await _dbContext.Set<SystemConfig>().FirstOrDefaultAsync(cancellationToken);
		if (existingConfig is null)
		{
			return Error.Failure(description: "System configuration not found.");
		}

		var expiryDate = _dataProvider.Now.AddDays(request.ExpirationDays);
		meeting.PublicLinkEnabled = true;
		meeting.PublicLinkExpiration = expiryDate;

		var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (saveResult.IsFailure)
		{
			return Error.Failure(description: "Failed to save changes. Please try again later.");
		}

		var generatedLink = _meetingUrlService.GeneratePublicMeetingUrl(existingConfig.ServiceBaseUrl, meeting.Id, meeting.MeetId);

		return new GetMeetingUrlResponse(generatedLink, expiryDate);
	}
}
