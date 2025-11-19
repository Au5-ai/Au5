using Au5.Application.Common;

namespace Au5.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;

public class RemoveMeetingFromSpaceCommandHandler : IRequestHandler<RemoveMeetingFromSpaceCommand, Result<RemoveMeetingFromSpaceResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public RemoveMeetingFromSpaceCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<RemoveMeetingFromSpaceResponse>> Handle(RemoveMeetingFromSpaceCommand request, CancellationToken cancellationToken)
	{
		var meetingSpace = await _dbContext.Set<MeetingSpace>()
			.FirstOrDefaultAsync(ms => ms.MeetingId == request.MeetingId && ms.SpaceId == request.SpaceId, cancellationToken);

		if (meetingSpace == null)
		{
			return Error.NotFound("MeetingSpace.NotFound", AppResources.MeetingSpace.MeetingNotInSpace);
		}

		_dbContext.Set<MeetingSpace>().Remove(meetingSpace);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return new RemoveMeetingFromSpaceResponse(true, AppResources.MeetingSpace.RemovedSuccessfully);
	}
}
