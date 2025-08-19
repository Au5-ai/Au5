using Au5.Application.Common.Abstractions;

namespace Au5.IntegrationTests;

public class TestCurrentUserServiceFake : ICurrentUserService
{
	public Guid UserId { get; set; } = Guid.Empty;

	public bool IsAuthenticated { get; set; } = false;
}
