using Au5.Application.Common.Abstractions;
using Au5.Domain.Common;
using Au5.Shared;

namespace Au5.BackEnd.Services;

/// <summary>
/// Implementation of ICurrentUserService that extracts user information from HTTP context claims.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimConstants.UserId)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }

    public RoleTypes? Role
	{
		get
		{
			var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimConstants.Role)?.Value;
			return byte.TryParse(roleClaim, out var roleByte) ? (RoleTypes)roleByte : null;
		}
	}

    public Guid OrganizationId
    {
        get
        {
            var orgIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimConstants.OrganizationId)?.Value;
            return Guid.TryParse(orgIdClaim, out var orgId) ? orgId : Guid.Empty;
        }
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;
}
