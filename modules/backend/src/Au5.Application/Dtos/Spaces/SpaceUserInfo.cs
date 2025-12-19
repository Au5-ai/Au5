namespace Au5.Application.Dtos.Spaces;

public record SpaceUserInfo
{
	public Guid UserId { get; init; }

	public bool IsYou { get; init; }

	public string FullName { get; init; }

	public string Email { get; init; }

	public bool IsAdmin { get; init; }

	public string PictureUrl { get; init; }

	public DateTime JoinedAt { get; init; }
}
