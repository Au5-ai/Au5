using Au5.Application.Models.Authentication;

namespace Au5.Application.Interfaces;

public interface IAuthenticationService
{
    Task<ErrorOr<object>> LoginAsync(LoginRequestDto request);
}
