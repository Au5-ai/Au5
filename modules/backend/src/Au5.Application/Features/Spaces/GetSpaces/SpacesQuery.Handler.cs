using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.GetSpaces;

public class GetSpacesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService) : IRequestHandler<SpacesQuery, Result<IReadOnlyCollection<SpaceResponse>>>
{
	private readonly IApplicationDbContext _context = context;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<IReadOnlyCollection<SpaceResponse>>> Handle(SpacesQuery request, CancellationToken cancellationToken)
	{
		var organizationId = _currentUserService.OrganizationId;

		var spaces = await _context.Set<Space>()
			.Include(s => s.UserSpaces)
				.ThenInclude(us => us.User)
			.Where(s => s.IsActive && s.OrganizationId == organizationId)
			.AsNoTracking()
			.ToListAsync(cancellationToken);

		var spaceResponses = spaces.Select(s => new SpaceResponse
		{
			Id = s.Id,
			Name = s.Name,
			Description = s.Description,
			IsActive = s.IsActive,
			Users = s.UserSpaces?.Select(us => new SpaceUserInfo
			{
				UserId = us.UserId,
				FullName = us.User.FullName,
				Email = us.User.Email,
				PictureUrl = us.User.PictureUrl,
				JoinedAt = us.JoinedAt,
				IsAdmin = us.IsAdmin,
				IsYou = us.UserId.Equals(_currentUserService.UserId)
			}).ToList() ?? []
		}).ToList();

		return spaceResponses;
	}
}
