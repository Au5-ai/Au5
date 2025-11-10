using Au5.Application.Common;

namespace Au5.Application.Features.Admin.Create;

public class CreateAdminCommandHandler : IRequestHandler<CreateAdminCommand, Result<CreateAdminResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IDataProvider _dataProvider;

	public CreateAdminCommandHandler(IApplicationDbContext dbContext, IDataProvider dataProvider)
	{
		_dbContext = dbContext;
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result<CreateAdminResponse>> Handle(CreateAdminCommand request, CancellationToken cancellationToken)
	{
		var admin = await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Role == RoleTypes.Admin && x.IsActive, cancellationToken);
		if (admin is not null)
		{
			return Error.Unauthorized(description: AppResources.Auth.UnAuthorizedAction);
		}

		var userId = _dataProvider.NewGuid();
		admin = new User
		{
			Id = userId,
			Email = request.Email,
			FullName = request.FullName,
			Password = HashHelper.HashPassword(request.Password, userId),
			IsActive = true,
			Role = RoleTypes.Admin,
			CreatedAt = _dataProvider.Now,
			PictureUrl = string.Empty,
			Status = UserStatus.CompleteSignUp
		};

		_dbContext.Set<User>().Add(admin);
		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsFailure
			? Error.Failure(description: AppResources.System.FailedToAddAdmin)
			: new CreateAdminResponse
			{
				IsDone = dbResult.IsSuccess
			};
	}
}
