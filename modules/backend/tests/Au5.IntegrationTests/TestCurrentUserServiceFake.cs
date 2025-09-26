using Au5.Application.Common.Abstractions;
using Au5.Domain.Common;

namespace Au5.IntegrationTests;

public class TestCurrentUserServiceFake : ICurrentUserService
{
	public Guid UserId { get; set; } = Guid.Empty;

	public RoleTypes? Role { get; set; } = RoleTypes.Admin;

	public bool IsAuthenticated { get; set; } = false;
}
