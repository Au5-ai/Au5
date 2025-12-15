using Au5.Application.Common;
using Au5.Application.Common.Options;
using Au5.Application.Common.Utils;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Admin.Create;

public class CreateAdminCommandHandler : IRequestHandler<CreateAdminCommand, Result<CreateAdminResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IDataProvider _dataProvider;
	private readonly OrganizationOptions _organizationOptions;

	public CreateAdminCommandHandler(
		IApplicationDbContext dbContext,
		IDataProvider dataProvider,
		IOptions<OrganizationOptions> organizationOptions)
	{
		_dbContext = dbContext;
		_dataProvider = dataProvider;
		_organizationOptions = organizationOptions.Value;
	}

	public async ValueTask<Result<CreateAdminResponse>> Handle(CreateAdminCommand request, CancellationToken cancellationToken)
	{
		var existingAdmin = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

		if (existingAdmin is not null)
		{
			return Error.Failure("Admin.AlreadyExists", AppResources.Admin.EmailAlreadyRegistered);
		}

		var organizationId = _dataProvider.NewGuid();

		var organization = new Organization
		{
			Id = organizationId,
			OrganizationName = request.OrganizationName,
			BotName = $"{request.OrganizationName}_Bot",
			Direction = _organizationOptions.Direction,
			Language = _organizationOptions.Language,
		};

		_dbContext.Set<Organization>().Add(organization);

		var userId = _dataProvider.NewGuid();
		var admin = new User
		{
			Id = userId,
			Email = request.Email,
			FullName = request.FullName,
			Password = HashHelper.HashPassword(request.Password, userId),
			IsActive = true,
			Role = RoleTypes.Admin,
			CreatedAt = _dataProvider.Now,
			PictureUrl = UrlGenerator.GetGravatarUrl(request.Email),
			Status = UserStatus.CompleteSignUp,
			OrganizationId = organizationId
		};

		_dbContext.Set<User>().Add(admin);
		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsFailure
			? Error.Failure("Admin.FailedToCreate", AppResources.Organization.FailedToAddAdmin)
			: new CreateAdminResponse
			{
				IsDone = dbResult.IsSuccess
			};
	}
}
