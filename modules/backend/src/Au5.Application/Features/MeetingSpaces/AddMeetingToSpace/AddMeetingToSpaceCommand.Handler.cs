using Au5.Application.Common;

namespace Au5.Application.Features.MeetingSpaces.AddMeetingToSpace;

public class AddMeetingToSpaceCommandHandler : IRequestHandler<AddMeetingToSpaceCommand, Result<AddMeetingToSpaceResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;
	private readonly IDataProvider _dataProvider;

	public AddMeetingToSpaceCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService, IDataProvider dataProvider)
	{
		_dbContext = dbContext;
		_currentUserService = currentUserService;
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result<AddMeetingToSpaceResponse>> Handle(AddMeetingToSpaceCommand request, CancellationToken cancellationToken)
	{
		var organizationId = _currentUserService.OrganizationId;

		var meeting = await _dbContext.Set<Meeting>()
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId, cancellationToken);

		if (meeting == null)
		{
			return Error.NotFound(description: AppResources.MeetingSpace.MeetingNotFound);
		}

		var space = await _dbContext.Set<Space>()
			.FirstOrDefaultAsync(s => s.Id == request.SpaceId && s.IsActive && s.OrganizationId == organizationId, cancellationToken);

		if (space == null)
		{
			return Error.NotFound(description: AppResources.MeetingSpace.SpaceNotFound);
		}

		var existingMeetingSpace = await _dbContext.Set<MeetingSpace>()
			.FirstOrDefaultAsync(ms => ms.MeetingId == request.MeetingId && ms.SpaceId == request.SpaceId, cancellationToken);

		if (existingMeetingSpace != null)
		{
			return Error.BadRequest(description: AppResources.MeetingSpace.MeetingAlreadyInSpace);
		}

		var meetingSpace = new MeetingSpace
		{
			MeetingId = request.MeetingId,
			SpaceId = request.SpaceId,
			UserId = _currentUserService.UserId,
			CreatedAt = _dataProvider.UtcNow
		};

		_dbContext.Set<MeetingSpace>().Add(meetingSpace);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return new AddMeetingToSpaceResponse(true, AppResources.MeetingSpace.AddedSuccessfully);
	}
}
