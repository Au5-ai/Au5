using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.GetMyInfo;

public class GetMyInfoQueryHandler(IApplicationDbContext applicationDbContext) : IRequestHandler<GetMyInfoQuery, Result<Participant>>
{
	private readonly IApplicationDbContext _dbContext = applicationDbContext;

	public async ValueTask<Result<Participant>> Handle(GetMyInfoQuery request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.UserId && x.IsActive, cancellationToken);
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
