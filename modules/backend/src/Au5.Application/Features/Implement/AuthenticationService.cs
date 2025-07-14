using System.Security.Cryptography;
using System.Text;
using Au5.Application.Common.Interfaces;
using Au5.Application.Models.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Implement;

public class AuthenticationService(IApplicationDbContext context, ITokenService tokenService) : IAuthenticationService
{
	private readonly IApplicationDbContext _context = context;
	private readonly ITokenService _tokenService = tokenService;

	public async Task<ErrorOr<LoginResponse>> LoginAsync(LoginRequestDto request)
	{
		var user = await _context.Set<User>()
			.FirstOrDefaultAsync(u => u.Email == request.Username && u.IsActive)
			.ConfigureAwait(false);

		if (user is null || user.Password != request.Password.HashPassword(user.Id))
		{
			return Error.Unauthorized(description: "Username or password is incorrect.");
		}

		Participant participant = new(user);
		var token = _tokenService.GenerateToken(participant, "User");

		return new LoginResponse()
		{
			AccessToken = token,
			RefreshToken = string.Empty,
			Participant = new ParticipantDto()
			{
				FullName = user.FullName,
				PictureUrl = user.PictureUrl,
				Email = user.Email
			}
		};
	}
}

#pragma warning disable SA1400 // Access modifier should be declared
file static class AuthenticationExtensions
{
	public static string HashPassword(this string password, Guid salt)
	{
		var salted = Encoding.UTF8.GetBytes(password + salt);
		var hash = SHA256.HashData(salted);
		return Convert.ToBase64String(hash);
	}
}
#pragma warning restore SA1400 // Access modifier should be declared
