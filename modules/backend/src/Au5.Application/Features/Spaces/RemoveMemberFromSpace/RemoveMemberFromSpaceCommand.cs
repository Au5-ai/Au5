namespace Au5.Application.Features.Spaces.RemoveMemberFromSpace;

public record RemoveMemberFromSpaceCommand(Guid SpaceId, Guid MemberUserId) : IRequest<Result<RemoveMemberFromSpaceResponse>>;
public record RemoveMemberFromSpaceResponse(bool Success, string Message);
