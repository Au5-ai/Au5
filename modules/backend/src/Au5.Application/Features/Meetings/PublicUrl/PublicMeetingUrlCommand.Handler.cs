using Au5.Application.Common.Options;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Meetings.PublicUrl;

public class GetMeetingUrlCommandHandler(
		IUrlGenerator urlGenerator,
		IApplicationDbContext dbContext,
		IDataProvider dataProvider,
		IOptions<OrganizationOptions> options) : IRequestHandler<PublicMeetingUrlCommand, Result<PublicMeetingUrlResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly IUrlGenerator _urlGenerator = urlGenerator;
	private readonly IDataProvider _dataProvider = dataProvider;
	private readonly OrganizationOptions _organizationOptions = options.Value;

	public async ValueTask<Result<PublicMeetingUrlResponse>> Handle(PublicMeetingUrlCommand request, CancellationToken cancellationToken)
	{
		if (_organizationOptions is null || string.IsNullOrEmpty(_organizationOptions.ServiceBaseUrl))
		{
			return Error.Failure(description: "BaseUrl Of Service is not set.");
		}

		var meeting = await _dbContext.Set<Meeting>().FirstOrDefaultAsync(s => s.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		var expiryDate = _dataProvider.Now.AddDays(request.ExpirationDays);
		meeting.PublicLinkEnabled = true;
		meeting.PublicLinkExpiration = expiryDate;

		var saveResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (saveResult.IsFailure)
		{
			return Error.Failure(description: "Failed to save changes. Please try again later.");
		}

		var generatedLink = _urlGenerator.GeneratePublicMeetingUrl(_organizationOptions.ServiceBaseUrl, meeting.Id, meeting.MeetId);

		return new PublicMeetingUrlResponse(generatedLink, expiryDate);
	}
}
