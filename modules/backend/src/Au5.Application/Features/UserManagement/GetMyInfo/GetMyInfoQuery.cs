namespace Au5.Application.Features.UserManagement.GetMyInfo;

public record GetMyInfoQuery() : IRequest<Result<UserInfo>>;

public class UserInfo
{
	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	public string Email { get; set; }

	public string Role { get; set; }
}
