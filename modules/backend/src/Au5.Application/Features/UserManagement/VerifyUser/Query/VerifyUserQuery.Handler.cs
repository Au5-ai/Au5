using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.VerifyUser.Query;

public class VerifyUserQueryHandler : IRequestHandler<VerifyUserQuery, Result<bool>>
{
	private readonly IApplicationDbContext _context;

	public VerifyUserQueryHandler(IApplicationDbContext context)
	{
		_context = context;
	}

	public async ValueTask<Result<bool>> Handle(VerifyUserQuery request, CancellationToken cancellationToken)
	{
		var user = await _context.Set<User>().FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);
		if (user is null)
		{
			return Error.BadRequest(description: AppResources.User.UserNotFound);
		}

		if (HashHelper.HashSafe(user.Email) != request.EmailHashed)
		{
			return Error.BadRequest(description: AppResources.User.UserNotFound);
		}

		return true;
	}
}
