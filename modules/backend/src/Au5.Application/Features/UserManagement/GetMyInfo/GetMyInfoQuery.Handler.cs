using Au5.Application.Common;

namespace Au5.Application.Features.UserManagement.GetMyInfo;

public class GetMyInfoQueryHandler(IApplicationDbContext applicationDbContext, ICurrentUserService currentUserService) : IRequestHandler<GetMyInfoQuery, Result<UserInfo>>
{
	private readonly IApplicationDbContext _dbContext = applicationDbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<UserInfo>> Handle(GetMyInfoQuery request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>().AsNoTracking()
			.Where(x => x.Id == _currentUserService.UserId && x.IsActive)
			.Select(user => new UserInfo
			{
				Id = user.Id,
				FullName = user.FullName,
				PictureUrl = user.PictureUrl,
				Email = user.Email,
				Role = user.Role.ToString()
			}).FirstOrDefaultAsync(cancellationToken);

		return user == null
			? Error.Unauthorized("Auth.Unauthorized", AppResources.Auth.UnAuthorizedAction)
			: user;
	}
}
