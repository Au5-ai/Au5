using Au5.Application.Common;
using Au5.Application.Features.Authentication.Login;

namespace Au5.Application.Features.Authentication.RefreshToken;

public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<TokenResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ITokenService _tokenService;
	private readonly IDataProvider _dataProvider;

	public RefreshTokenCommandHandler(
		IApplicationDbContext dbContext,
		ITokenService tokenService,
		IDataProvider dataProvider)
	{
		_dbContext = dbContext;
		_tokenService = tokenService;
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result<TokenResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken && u.IsActive, cancellationToken);

		if (user == null)
		{
			return Error.Unauthorized(description: AppResources.Auth.InvalidRefreshToken);
		}

		if (!(user.RefreshTokenExpiry > _dataProvider.UtcNow))
		{
			user.RevokeRefreshToken(); // Security measure: revoke if expired
			await _dbContext.SaveChangesAsync(cancellationToken);
			return Error.Unauthorized(description: AppResources.Auth.RefreshTokenExpired);
		}

		var tokenResponse = _tokenService.GenerateToken(user.Id, user.FullName, user.Role);
		var expiryDays = _tokenService.GetRefreshTokenExpiryDays();

		SetUserRefreshToken(user, tokenResponse.RefreshToken, expiryDays);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return tokenResponse;
	}

	private void SetUserRefreshToken(User user, string refreshToken, int expiryDays)
	{
		user.RefreshToken = refreshToken;
		user.RefreshTokenExpiry = _dataProvider.UtcNow.AddDays(expiryDays);
	}
}
