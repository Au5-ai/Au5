using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Authentication;

public sealed class AuthenticationHandler(IApplicationDbContext dbContext, ITokenService tokenService) : IRequestHandler<LoginRequest, Result<LoginResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ITokenService _tokenService = tokenService;

	public async ValueTask<Result<LoginResponse>> Handle(LoginRequest request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Username && u.IsActive, cancellationToken)
			.ConfigureAwait(false);

		if (user is null || user.Password != HashPassword(request.Password, user.Id))
		{
			return Error.Unauthorized(description: "Username or password is incorrect.");
		}

		var token = _tokenService.GenerateToken(user.Id, user.FullName, "User");

		return new LoginResponse(
					AccessToken: token,
					Participant: new Participant
					{
						Id = user.Id,
						FullName = user.FullName,
						PictureUrl = user.PictureUrl,
						HasAccount = true,
					});
	}

	private static string HashPassword(string password, Guid salt)
	{
		var salted = System.Text.Encoding.UTF8.GetBytes(password + salt);
		var hash = System.Security.Cryptography.SHA256.HashData(salted);
		return Convert.ToBase64String(hash);
	}
}
