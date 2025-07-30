using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.GetMyInfo;

public class GetMyInfoQueryHandler(IApplicationDbContext applicationDbContext) : IRequestHandler<GetMyInfoQuery, Result<Participant>>
{
	private readonly IApplicationDbContext _dbContext = applicationDbContext;

	public async ValueTask<Result<Participant>> Handle(GetMyInfoQuery request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Id == request.UserId && x.IsActive, cancellationToken);
		return user == null
			? Error.Unauthorized(description: AppResources.UnAuthorizedAction)
			: new Participant
			{
				Id = user.Id,
				FullName = user.FullName,
				PictureUrl = user.PictureUrl,
				HasAccount = true,
			};
	}
}
