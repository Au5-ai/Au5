using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.RemoveUserFromSpace;

public class RemoveUserFromSpaceCommandHandler : IRequestHandler<RemoveUserFromSpaceCommand, Result>
{
	private readonly IApplicationDbContext _context;
	private readonly ICurrentUserService _currentUserService;

	public RemoveUserFromSpaceCommandHandler(
		IApplicationDbContext context,
		ICurrentUserService currentUserService)
	{
		_context = context;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result> Handle(RemoveUserFromSpaceCommand request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;
		var organizationId = _currentUserService.OrganizationId;

		var space = await _context.Set<Space>()
			.Include(s => s.UserSpaces)
			.FirstOrDefaultAsync(s => s.Id == request.SpaceId && s.OrganizationId == organizationId && s.IsActive, cancellationToken);

		if (space == null)
		{
			return Error.NotFound("Space.NotFound", AppResources.Space.NotFoundMessage);
		}

		var currentUserSpace = space.UserSpaces.FirstOrDefault(us => us.UserId == currentUserId);
		var targetUserSpace = space.UserSpaces.FirstOrDefault(us => us.UserId == request.UserId);

		if (targetUserSpace == null)
		{
			return Error.NotFound("Space.UserNotInSpace", AppResources.Space.UserNotInSpaceMessage);
		}

		if (request.UserId != currentUserId && (currentUserSpace == null || !currentUserSpace.IsAdmin))
		{
			return Error.Forbidden("Space.NoPermission", AppResources.Space.NoPermissionMessage);
		}

		_context.Set<UserSpace>().Remove(targetUserSpace);

		var result = await _context.SaveChangesAsync(cancellationToken);

		return result.IsFailure
			? Error.Failure("Space.FailedToRemoveUser", AppResources.Space.RemoveUserFailedMessage)
			: Result.Success();
	}
}
