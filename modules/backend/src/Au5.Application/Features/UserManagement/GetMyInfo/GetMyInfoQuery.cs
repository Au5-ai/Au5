namespace Au5.Application.Features.UserManagement.GetMyInfo;

public record GetMyInfoQuery(Guid UserId) : IRequest<Result<Participant>>;
