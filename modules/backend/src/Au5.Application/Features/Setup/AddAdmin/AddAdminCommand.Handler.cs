using Au5.Application.Common;

namespace Au5.Application.Features.Setup.AddAdmin;

public class AddAdminQueryHandler : IRequestHandler<AddAdminCommand, Result<AddAdminResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public AddAdminQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<AddAdminResponse>> Handle(AddAdminCommand request, CancellationToken cancellationToken)
	{
		var admin = await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Role == RoleTypes.Admin && x.IsActive, cancellationToken);
		if (admin is not null)
		{
			return Error.Unauthorized(description: AppResources.Auth.UnAuthorizedAction);
		}

		var userId = Guid.NewGuid();
		admin = new User
		{
			Id = userId,
			Email = request.Email,
			FullName = request.FullName,
			Password = HashHelper.HashPassword(request.Password, userId),
			IsActive = true,
			Role = RoleTypes.Admin,
			CreatedAt = DateTime.Now,
			PictureUrl = string.Empty,
			Status = UserStatus.CompleteSignUp
		};

		_dbContext.Set<User>().Add(admin);
		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsFailure
			? Error.Failure(description: AppResources.System.FailedToAddAdmin)
			: new AddAdminResponse
			{
				IsDone = dbResult.IsSuccess
			};
	}
}
