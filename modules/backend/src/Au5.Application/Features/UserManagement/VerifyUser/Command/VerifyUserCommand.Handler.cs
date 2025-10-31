using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.VerifyUser.Command;

public class VerifyUserCommandHandler : IRequestHandler<VerifyUserCommand, Result<VerifyUserResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IDataProvider _dataProvider;

	public VerifyUserCommandHandler(IApplicationDbContext dbContext, IDataProvider dataProvider)
	{
		_dbContext = dbContext;
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result<VerifyUserResponse>> Handle(VerifyUserCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);
		if (user is null)
		{
			return Error.BadRequest(description: AppResources.User.UserNotFound);
		}

		if (user.IsRegistered())
		{
			return Error.Unauthorized(description: AppResources.Auth.UnAuthorizedAction);
		}

		if (HashHelper.HashSafe(user.Email) != request.HashedEmail)
		{
			return Error.BadRequest(description: AppResources.User.UserNotFound);
		}

		user.FullName = request.FullName;
		user.Password = HashHelper.HashPassword(request.Password, request.UserId);
		user.Status = UserStatus.CompleteSignUp;
		user.IsActive = true;
		user.LastPasswordChangeAt = _dataProvider.Now;

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsFailure
			? Error.Failure(description: AppResources.User.FailedToUpdateUserInfo)
			: new VerifyUserResponse
			{
				IsDone = dbResult.IsSuccess
			};
	}
}
