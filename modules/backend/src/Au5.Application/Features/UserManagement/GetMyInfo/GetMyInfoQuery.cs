namespace Au5.Application.Features.UserManagement.GetMyInfo;

public record GetMyInfoQuery() : IRequest<Result<UserInfo>>;

public class UserInfo
{
	public Guid Id { get; init; }

	public string FullName { get; init; }

	public string PictureUrl { get; init; }

	public string Email { get; init; }

	public string Role { get; init; }

	public string OrganizationName { get; init; }

	public string OrganizationLogo { get; init; }
}
