using System.Security.Claims;

namespace Au5.Shared;

public static class ClaimConstants
{
	public const string UserId = ClaimTypes.NameIdentifier;
	public const string Name = ClaimTypes.Name;
	public const string Role = ClaimTypes.Role;
	public const string OrganizationId = "organization_id";
	public const string Jti = "jti";
	public const string Exp = "exp";
}
