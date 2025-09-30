using Au5.Application.Common;

namespace Au5.Application.Features.UserManagement.GetMyInfo;

public class GetMyInfoQueryHandler(IApplicationDbContext applicationDbContext, ICurrentUserService currentUserService) : IRequestHandler<GetMyInfoQuery, Result<Participant>>
{
	private readonly IApplicationDbContext _dbContext = applicationDbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<Participant>> Handle(GetMyInfoQuery request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId && x.IsActive, cancellationToken);
		return user == null
			? Error.Unauthorized(description: AppResources.Auth.UnAuthorizedAction)
			: new Participant
			{
				Id = user.Id,
				FullName = user.FullName,
				PictureUrl = user.PictureUrl,
				Email = user.Email
			};
	}
}
