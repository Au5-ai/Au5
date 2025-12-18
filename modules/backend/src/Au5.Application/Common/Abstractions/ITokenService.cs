using Au5.Application.Features.Authentication.Login;

namespace Au5.Application.Common.Abstractions;

public interface ITokenService
{
	TokenResponse GenerateToken(Guid extensionId, string fullName, RoleTypes role, Guid organizationId);

	string GenerateBotToken(Guid meetingId, string meetId);

	Task BlacklistTokenAsync(string userId, string jti, DateTime expiry);

	Task<bool> IsTokenBlacklistedAsync(string userId, string jti);
}
