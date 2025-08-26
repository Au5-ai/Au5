using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

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
			return Error.Unauthorized(description: AppResources.UnAuthorizedAction);
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
			CreatedAt = DateTime.UtcNow,
			PictureUrl = Constants.DefaultPictureUrl
		};

		_dbContext.Set<User>().Add(admin);
		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsFailure
			? Error.Failure(description: AppResources.FailedToSetup)
			: new AddAdminResponse
			{
				IsDone = dbResult.IsSuccess
			};
	}
}
