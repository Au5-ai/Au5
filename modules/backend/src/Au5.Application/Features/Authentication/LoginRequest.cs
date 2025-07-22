namespace Au5.Application.Features.Authentication;

public record LoginRequest(string Username, string Password) : IRequest<Result<LoginResponse>>;

public record LoginResponse(string AccessToken, Participant Participant);
