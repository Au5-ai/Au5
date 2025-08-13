using Au5.Application.Common.Abstractions;

namespace Au5.Application.Features.UserManagement.GetMyInfo;

public record GetMyInfoQuery() : BaseUserQuery<Result<Participant>>;
