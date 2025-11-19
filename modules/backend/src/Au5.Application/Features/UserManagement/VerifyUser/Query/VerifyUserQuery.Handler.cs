using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.VerifyUser.Query;

public class VerifyUserQueryHandler : IRequestHandler<VerifyUserQuery, Result<VerifyUserResponse>>
{
	private readonly IApplicationDbContext _context;

	public VerifyUserQueryHandler(IApplicationDbContext context)
	{
		_context = context;
	}

	public async ValueTask<Result<VerifyUserResponse>> Handle(VerifyUserQuery request, CancellationToken cancellationToken)
	{
		var user = await _context.Set<User>().FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);
		if (user is null)
		{
			return Error.BadRequest("User.NotFound", AppResources.User.UserNotFound);
		}

		if (HashHelper.HashSafe(user.Email) != request.HashedEmail)
		{
			return Error.BadRequest("User.NotFound", AppResources.User.UserNotFound);
		}

		if (user.IsRegistered())
		{
			return Error.Unauthorized("User.AlreadyRegistered", AppResources.Auth.UnAuthorizedAction);
		}

		return new VerifyUserResponse(user.Email);
	}
}
