using Au5.Application.Features.Authentication;

namespace Au5.Application.Common.Abstractions;

public interface ITokenService
{
	TokenResponse GenerateToken(Guid extensionId, string fullName, string role);

	Task BlacklistTokenAsync(string userId, string jti, DateTime expiry);

	Task<bool> IsTokenBlacklistedAsync(string userId, string jti);
}
