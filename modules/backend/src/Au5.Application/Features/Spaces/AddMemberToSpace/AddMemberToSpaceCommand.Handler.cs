namespace Au5.Application.Features.Spaces.AddMemberToSpace;

public class AddMemberToSpaceCommandHandler : IRequestHandler<AddMemberToSpaceCommand, Result<AddMemberToSpaceResponse>>
{
	public ValueTask<Result<AddMemberToSpaceResponse>> Handle(AddMemberToSpaceCommand request, CancellationToken cancellationToken)
	{
		throw new NotImplementedException();
	}
}
