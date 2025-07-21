using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Interfaces;
using Au5.Application.Models.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Implement;

public class AuthenticationService(IApplicationDbContext context, ITokenService tokenService) : IAuthenticationService
{
	private readonly IApplicationDbContext _context = context;
	private readonly ITokenService _tokenService = tokenService;

	public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct)
	{
		var user = await _context.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Username && u.IsActive, ct)
			.ConfigureAwait(false);

		if (user is null || user.Password != HashPassword(request.Password, user.Id))
		{
			return Error.Unauthorized(description: "Username or password is incorrect.");
		}

		var token = _tokenService.GenerateToken(user.Id, user.FullName, "User");

		return new LoginResponse(
					accessToken: token,
					refreshToken: string.Empty,
					participant: new
					{
						fullName = user.FullName,
						pictureUrl = user.PictureUrl,
						id = user.Id
					});
	}

	private static string HashPassword(string password, Guid salt)
	{
		var salted = System.Text.Encoding.UTF8.GetBytes(password + salt);
		var hash = System.Security.Cryptography.SHA256.HashData(salted);
		return Convert.ToBase64String(hash);
	}
}
