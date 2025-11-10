using Au5.Application.Features.Spaces.GetSpaces;

namespace Au5.Application.Features.Spaces.GetSpaceMembers;

public class GetSpaceMembersQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	: IRequestHandler<GetSpaceMembersQuery, Result<GetSpaceMembersResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<GetSpaceMembersResponse>> Handle(GetSpaceMembersQuery request, CancellationToken cancellationToken)
	{
		Guid currentUserId = _currentUserService.UserId;

		var space = await _dbContext.Set<Space>()
			.Include(s => s.UserSpaces)
				.ThenInclude(us => us.User)
			.AsNoTracking()
			.FirstOrDefaultAsync(s => s.Id == request.SpaceId && s.IsActive, cancellationToken);

		if (space is null)
		{
			return Error.NotFound("Space.NotFound", "The requested space does not exist or is inactive.");
		}

		if (space.UserSpaces?.Any(x => x.UserId == currentUserId) != true)
		{
			return Error.Forbidden("Space.Access.Denied", "You do not have access to this space");
		}

		return new GetSpaceMembersResponse()
		{
			Users = [.. space.UserSpaces
				.Where(member => member.User.IsActive)
				.Select(member => new SpaceUserInfo
			{
				UserId = member.UserId,
				Email = member.User.Email,
				JoinedAt = member.JoinedAt,
				IsAdmin = member.IsAdmin,
				FullName = member.User.FullName,
				PictureUrl = member.User.PictureUrl
			})]
		};
	}
}
