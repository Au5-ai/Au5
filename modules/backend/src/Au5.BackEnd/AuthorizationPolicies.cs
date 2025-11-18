namespace Au5.BackEnd;

public static class AuthorizationPolicies
{
	public const string AdminOnly = nameof(AdminOnly);
	public const string UserOnly = nameof(UserOnly);
	public const string UserOrAdmin = nameof(UserOrAdmin);
}
