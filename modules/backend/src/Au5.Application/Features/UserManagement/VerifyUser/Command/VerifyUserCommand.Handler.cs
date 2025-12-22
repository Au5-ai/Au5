using Au5.Application.Common;

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
			return Error.BadRequest("User.NotFound", AppResources.User.UserNotFound);
		}

		if (user.IsRegistered())
		{
			return Error.Unauthorized("User.AlreadyRegistered", AppResources.Auth.UnAuthorizedAction);
		}

		if (HashHelper.HashSafe(user.Email) != request.HashedEmail)
		{
			return Error.BadRequest("User.NotFound", AppResources.User.UserNotFound);
		}

		user.FullName = request.FullName;
		user.Password = HashHelper.HashPassword(request.Password, request.UserId);
		user.Status = UserStatus.CompleteSignUp;
		user.IsActive = true;
		user.LastPasswordChangeAt = _dataProvider.Now;

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsFailure
			? Error.Failure("User.FailedToUpdate", AppResources.User.FailedToUpdateUserInfo)
			: new VerifyUserResponse
			{
				Email = user.Email,
				IsDone = dbResult.IsSuccess
			};
	}
}
