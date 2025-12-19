using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.SpaceMembers;

public sealed class SpaceMembersQueryHandler : IRequestHandler<SpaceMemebersQuery, Result<SpaceMembersResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public SpaceMembersQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
		_currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
	}

	public async ValueTask<Result<SpaceMembersResponse>> Handle(SpaceMemebersQuery request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;
		var organizationId = _currentUserService.OrganizationId;

		var spaceData = await _dbContext.Set<Space>()
			.Where(s => s.Id == request.SpaceId && s.IsActive && s.OrganizationId == organizationId)
			.Select(s => new
			{
				Members = s.UserSpaces
					.Where(us => us.User.IsActive)
					.Select(us => new SpaceUserInfo
					{
						UserId = us.UserId,
						Email = us.User.Email,
						JoinedAt = us.JoinedAt,
						IsAdmin = us.IsAdmin,
						FullName = us.User.FullName,
						PictureUrl = us.User.PictureUrl,
						IsYou = us.UserId.Equals(_currentUserService.UserId)
					})
					.ToArray()
			})
			.AsNoTracking()
			.FirstOrDefaultAsync(cancellationToken);

		if (spaceData is null)
		{
			return Error.NotFound("Space.NotFound", "The requested space does not exist or is inactive.");
		}

		if (!spaceData.Members.Any(us => us.UserId == currentUserId))
		{
			return Error.Forbidden("Space.AccessDenied", "You do not have access to this space.");
		}

		return new SpaceMembersResponse { Users = spaceData.Members };
	}
}
