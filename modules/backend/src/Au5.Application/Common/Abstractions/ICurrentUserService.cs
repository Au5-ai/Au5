namespace Au5.Application.Common.Abstractions;

/// <summary>
/// Provides access to the current authenticated user's context.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's unique identifier.
    /// </summary>
    Guid UserId { get; }

	/// <summary>
	/// Gets the user's RoleType from the JWT claim. Returns null if not available.
	/// </summary>
    RoleTypes? Role { get; }

	/// <summary>
	/// Gets a value indicating whether gets whether the current request is from an authenticated user.
	/// </summary>
    bool IsAuthenticated { get; }
}
