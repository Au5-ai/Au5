using Microsoft.Extensions.Configuration;

namespace Au5.Application.Features.Meetings.GetSystemMeetingUrl;

public class GetMeetingUrlCommandHandler : IRequestHandler<GetMeetingUrlCommand, Result<GetMeetingUrlResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IMeetingUrlService _meetingUrlService;
	private readonly IConfiguration _configuration;

	public GetMeetingUrlCommandHandler(
		IMeetingUrlService meetingUrlService,
		IApplicationDbContext dbContext,
		IConfiguration configuration)
	{
		_meetingUrlService = meetingUrlService;
		_dbContext = dbContext;
		_configuration = configuration;
	}

	public async ValueTask<Result<GetMeetingUrlResponse>> Handle(GetMeetingUrlCommand request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>().FirstOrDefaultAsync(s => s.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		if (meeting.PublicLinkEnabled is not true)
		{
			meeting.PublicLinkEnabled = true;
		}

		meeting.PublicLinkExpiration = DateTime.UtcNow.AddDays(request.ExpirationDays);

		var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (saveResult.IsFailure)
		{
			return Error.Failure(description: "Failed to save changes. Please try again later.");
		}

		var generatedLink = _meetingUrlService.GetSystemMeetingUrl(_configuration["System:BaseUrl"], meeting.Id, meeting.MeetId);

		return new GetMeetingUrlResponse(generatedLink);
	}
}
