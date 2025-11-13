using Au5.Application.Common;

namespace Au5.Application.Features.Authentication.Login;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, Result<TokenResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ITokenService _tokenService;
	private readonly IDataProvider _dataProvider;

	public LoginCommandHandler(
		IApplicationDbContext dbContext,
		ITokenService tokenService,
		IDataProvider dataProvider)
	{
		_dbContext = dbContext;
		_tokenService = tokenService;
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result<TokenResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Username && u.IsActive, cancellationToken);

		if (user is null || user.Password != HashHelper.HashPassword(request.Password, user.Id))
		{
			return Error.Unauthorized(description: AppResources.Auth.InvalidUsernameOrPassword);
		}

		var tokenResponse = _tokenService.GenerateToken(user.Id, user.FullName, user.Role);
		var expiryDays = _tokenService.GetRefreshTokenExpiryDays();

		SetUserRefreshToken(user, tokenResponse.RefreshToken, expiryDays);
		user.LastLoginAt = _dataProvider.UtcNow;

		await _dbContext.SaveChangesAsync(cancellationToken);
		return tokenResponse;
	}

	private void SetUserRefreshToken(User user, string refreshToken, int expiryDays)
	{
		user.RefreshToken = refreshToken;
		user.RefreshTokenExpiry = _dataProvider.UtcNow.AddDays(expiryDays);
	}
}
