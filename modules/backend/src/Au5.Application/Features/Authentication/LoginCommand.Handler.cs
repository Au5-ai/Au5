using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Authentication;

public sealed class LoginCommandHandler(IApplicationDbContext dbContext, ITokenService tokenService) : IRequestHandler<LoginCommand, Result<TokenResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ITokenService _tokenService = tokenService;

	public async ValueTask<Result<TokenResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Username && u.IsActive, cancellationToken)
			.ConfigureAwait(false);

		if (user is null || user.Password != HashHelper.HashPassword(request.Password, user.Id))
		{
			return Error.Unauthorized(description: AppResources.InvalidUsernameOrPassword);
		}

		user.LastLoginAt = DateTime.UtcNow;
		await _dbContext.SaveChangesAsync(cancellationToken);
		return _tokenService.GenerateToken(user.Id, user.FullName, "User");
	}
}
