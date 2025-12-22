namespace Au5.Application.Features.UserManagement.VerifyUser.Query;

public record VerifyUserQuery(Guid UserId, string HashedEmail) : IRequest<Result<VerifyUserResponse>>;

public record VerifyUserResponse(string Email, bool isRegistered);
