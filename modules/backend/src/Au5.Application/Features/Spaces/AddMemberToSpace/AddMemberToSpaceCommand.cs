namespace Au5.Application.Features.Spaces.AddMemberToSpace;

public record AddMemberToSpaceCommand(Guid SpaceId, Guid NewMemberUserId, bool IsAdmin) : IRequest<Result<AddMemberToSpaceResponse>>;
public record AddMemberToSpaceResponse(Guid UserSpaceId);
