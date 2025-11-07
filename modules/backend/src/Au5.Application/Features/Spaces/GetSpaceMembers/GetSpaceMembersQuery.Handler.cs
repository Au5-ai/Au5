using Au5.Application.Features.Spaces.GetSpaces;

namespace Au5.Application.Features.Spaces.GetSpaceMembers;

public class GetSpaceMembersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
	: IRequestHandler<GetSpaceMembersQuery, Result<GetSpaceMembersResponse>>
{
	public async ValueTask<Result<GetSpaceMembersResponse>> Handle(GetSpaceMembersQuery request, CancellationToken cancellationToken)
	{
		Guid currentUserId = currentUserService.UserId;

		var space = await context.Set<Space>()
			.Include(s => s.UserSpaces)
				.ThenInclude(us => us.User)
			.AsNoTracking()
			.FirstOrDefaultAsync(s => s.Id == request.SpaceId && s.IsActive, cancellationToken);

		if (!space?.UserSpaces?.Any(x => x.UserId == currentUserId) ?? true)
		{
			return Error.Failure("Space.Access.Denied", "You do not have access to this space");
		}

		return new GetSpaceMembersResponse()
		{
			Users = [.. space.UserSpaces.Select(member => new SpaceUserInfo
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
