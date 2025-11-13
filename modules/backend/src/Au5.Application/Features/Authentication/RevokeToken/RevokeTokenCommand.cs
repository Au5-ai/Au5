namespace Au5.Application.Features.Authentication.RevokeToken;

public record RevokeTokenCommand(string RefreshToken) : IRequest<Result>;
