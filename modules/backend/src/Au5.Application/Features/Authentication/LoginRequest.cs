namespace Au5.Application.Features.Authentication;

public record LoginRequest(string Username, string Password) : IRequest<Result<TokenResponse>>;

public record TokenResponse(
    string AccessToken,
    int ExpiresIn,
    string? RefreshToken,
    string TokenType);
