using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.SpaceMembers;

public class SpaceMembersQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	: IRequestHandler<SpaceMemebersQuery, Result<SpaceMembersResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<SpaceMembersResponse>> Handle(SpaceMemebersQuery request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;

		var space = await _dbContext.Set<Space>()
			.Include(s => s.UserSpaces.Where(x => x.User.IsActive))
				.ThenInclude(us => us.User)
			.AsNoTracking()
			.FirstOrDefaultAsync(s => s.Id == request.SpaceId && s.IsActive, cancellationToken);

		if (space is null)
		{
			return Error.NotFound("Space.NotFound", "The requested space does not exist or is inactive.");
		}

		if (!space.UserSpaces.Any(x => x.UserId == currentUserId))
		{
			return Error.Forbidden("Space.Access.Denied", "You do not have access to this space");
		}

		return new SpaceMembersResponse()
		{
			Users = [.. space.UserSpaces
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
