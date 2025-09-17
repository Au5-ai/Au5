namespace Au5.Application.Features.UserManagement.VerifyUser.Query;

public record VerifyUserQuery(Guid UserId, string EmailHashed) : IRequest<Result<bool>>;
