namespace Au5.Application.Features.Spaces.RemoveMemberFromSpace;

public class RemoveMemberFromSpaceCommandHandler : IRequestHandler<RemoveMemberFromSpaceCommand, Result<RemoveMemberFromSpaceResponse>>
{
	public ValueTask<Result<RemoveMemberFromSpaceResponse>> Handle(RemoveMemberFromSpaceCommand request, CancellationToken cancellationToken)
	{
		throw new NotImplementedException();
	}
}
