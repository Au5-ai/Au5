using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.GetSpaces;

public class GetSpacesQueryHandler : IRequestHandler<GetSpacesQuery, Result<IReadOnlyCollection<SpaceResponse>>>
{
	private readonly IApplicationDbContext _context;

	public GetSpacesQueryHandler(IApplicationDbContext context)
	{
		_context = context;
	}

	public async ValueTask<Result<IReadOnlyCollection<SpaceResponse>>> Handle(GetSpacesQuery request, CancellationToken cancellationToken)
	{
		var spaces = await _context.Set<Space>()
			.Include(s => s.UserSpaces)
				.ThenInclude(us => us.User)
			.Where(s => s.IsActive)
			.AsNoTracking()
			.ToListAsync(cancellationToken);

		var spaceResponses = spaces.Select(s => new SpaceResponse
		{
			Id = s.Id,
			Name = s.Name,
			Description = s.Description,
			IsActive = s.IsActive,
			UsersCount = s.UserSpaces?.Count ?? 0,
			Users = s.UserSpaces?.Select(us => new SpaceUserInfo
			{
				UserId = us.UserId,
				FullName = us.User.FullName,
				Email = us.User.Email,
				PictureUrl = us.User.PictureUrl,
				JoinedAt = us.JoinedAt,
				IsAdmin = us.IsAdmin
			}).ToList() ?? []
		}).ToList();

		return spaceResponses;
	}
}
