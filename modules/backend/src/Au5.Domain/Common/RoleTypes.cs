namespace Au5.Domain.Common;

public enum RoleTypes : byte
{
	/// <summary>
	/// Administrator role with full system access.
	/// </summary>
	Admin = 1,

	/// <summary>
	/// Standard user role with limited access.
	/// </summary>
	User = 2,
}
