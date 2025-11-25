using Au5.Application.Common;

namespace Au5.Application.Features.Authentication.Login;

public sealed class LoginCommandHandler(IApplicationDbContext dbContext, ITokenService tokenService, IDataProvider dataProvider) : IRequestHandler<LoginCommand, Result<TokenResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ITokenService _tokenService = tokenService;
	private readonly IDataProvider _dataProvider = dataProvider;

	public async ValueTask<Result<TokenResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.AsNoTracking()
			.Where(u => u.Email == request.Username && u.IsActive)
			.Select(u => new User()
			{
				Id = u.Id,
				FullName = u.FullName,
				Password = u.Password,
				Role = u.Role,
				OrganizationId = u.OrganizationId
			})
			.FirstOrDefaultAsync(cancellationToken)
			.ConfigureAwait(false);

		if (user is null || user.Password != HashHelper.HashPassword(request.Password, user.Id))
		{
			return Error.Unauthorized("Auth.InvalidCredentials", AppResources.Auth.InvalidUsernameOrPassword);
		}

		user.LastLoginAt = _dataProvider.Now;
		await _dbContext.SaveChangesAsync(cancellationToken);
		return _tokenService.GenerateToken(user.Id, user.FullName, user.Role, user.OrganizationId);
	}
}
