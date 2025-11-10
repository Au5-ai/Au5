using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.GetSpaceMembers;

public class GetSpaceMembersQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	: IRequestHandler<GetSpaceMembersQuery, Result<GetSpaceMembersResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<GetSpaceMembersResponse>> Handle(GetSpaceMembersQuery request, CancellationToken cancellationToken)
	{
		Guid currentUserId = _currentUserService.UserId;

		var spaceInfo = await _dbContext.Set<Space>()
			.Where(s => s.Id == request.SpaceId)
			.Select(s => new { s.IsActive, IsMember = s.UserSpaces.Any(us => us.UserId == currentUserId) })
			.AsNoTracking()
			.FirstOrDefaultAsync(cancellationToken);

		if (spaceInfo is null || !spaceInfo.IsActive)
		{
			return Error.NotFound("Space.NotFound", "The requested space does not exist or is inactive.");
		}

		if (!spaceInfo.IsMember)
		{
			return Error.Forbidden("Space.Access.Denied", "You do not have access to this space");
		}

		var users = await _dbContext.Set<UserSpace>()
			.Where(us => us.SpaceId == request.SpaceId && us.User.IsActive)
			.AsNoTracking()
			.Select(member => new SpaceUserInfo
			{
				UserId = member.UserId,
				Email = member.User.Email,
				JoinedAt = member.JoinedAt,
				IsAdmin = member.IsAdmin,
				FullName = member.User.FullName,
				PictureUrl = member.User.PictureUrl
			})
			.ToListAsync(cancellationToken);

		return new GetSpaceMembersResponse()
		{
			Users = users
		};
	}
}
