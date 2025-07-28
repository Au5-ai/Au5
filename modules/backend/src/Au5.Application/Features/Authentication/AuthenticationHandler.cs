using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Authentication;

public sealed class AuthenticationHandler(IApplicationDbContext dbContext, ITokenService tokenService) : IRequestHandler<LoginRequest, Result<TokenResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ITokenService _tokenService = tokenService;

	public async ValueTask<Result<TokenResponse>> Handle(LoginRequest request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Username && u.IsActive, cancellationToken)
			.ConfigureAwait(false);

		if (user is null || user.Password != HashHelper.HashPassword(request.Password, user.Id))
		{
			return Error.Unauthorized(description: AppResources.InvalidUsernameOrPassword);
		}

		return _tokenService.GenerateToken(user.Id, user.FullName, "User");
	}
}
