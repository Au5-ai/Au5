using Au5.Application.Models.Authentication;

namespace Au5.Application.Interfaces
{
	public interface IAuthenticationService
	{
		Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
	}
}
