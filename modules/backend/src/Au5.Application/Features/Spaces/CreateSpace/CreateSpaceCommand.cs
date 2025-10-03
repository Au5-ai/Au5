namespace Au5.Application.Features.Spaces.CreateSpace;

public record CreateSpaceCommand : IRequest<Result<CreateSpaceResponse>>
{
	public string Name { get; init; }

	public string Description { get; init; }

	public Guid? ParentId { get; init; }

	public List<UserInSpace> Users { get; init; }
}

public record UserInSpace
{
	public Guid UserId { get; init; }

	public bool IsAdmin { get; init; }
}

public record CreateSpaceResponse
{
	public Guid Id { get; init; }
	public string Name { get; init; }
	public string Description { get; init; }
	public Guid? ParentId { get; init; }
	public string ParentName { get; init; }
	public bool IsActive { get; init; }
	public int UsersCount { get; init; }
	public List<SpaceUserResponse> Users { get; init; }
}

public record SpaceUserResponse
{
	public Guid UserId { get; init; }
	public string FullName { get; init; }
	public string Email { get; init; }
	public string PictureUrl { get; init; }
	public DateTime JoinedAt { get; init; }
	public bool IsAdmin { get; init; }
}
