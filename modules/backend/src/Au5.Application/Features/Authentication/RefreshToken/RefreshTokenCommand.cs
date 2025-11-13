using Au5.Application.Features.Authentication.Login;

namespace Au5.Application.Features.Authentication.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<TokenResponse>>;
