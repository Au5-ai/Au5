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

		if (!user.IsRefreshTokenValid(request.RefreshToken))
		{
			user.RevokeRefreshToken(); // Security measure: revoke if invalid
			await _dbContext.SaveChangesAsync(cancellationToken);
			return Error.Unauthorized(description: AppResources.Auth.RefreshTokenExpired);
		}

		var tokenResponse = _tokenService.GenerateToken(user.Id, user.FullName, user.Role);

		user.SetRefreshToken(tokenResponse.RefreshToken, _tokenService.GetRefreshTokenExpiryDays());
		await _dbContext.SaveChangesAsync(cancellationToken);

		return tokenResponse;
	}
}
