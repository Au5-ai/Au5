namespace Au5.Application.Features.Spaces.GetSpaces;

public record GetSpacesQuery : IRequest<Result<List<SpaceResponse>>>;

public record SpaceResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; }

    public string Description { get; init; }

    public Guid? ParentId { get; init; }

    public string ParentName { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }

    public bool IsActive { get; init; }

    public int ChildrenCount { get; init; }

    public int UsersCount { get; init; }

    public List<SpaceUserInfo> Users { get; init; }
}

public record SpaceUserInfo
{
    public Guid UserId { get; init; }

    public string FullName { get; init; }

    public string Email { get; init; }

    public bool IsAdmin { get; init; }

    public string PictureUrl { get; init; }

    public DateTime JoinedAt { get; init; }
}
