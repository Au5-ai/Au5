namespace Au5.Application.Models;

public class UserDto
{
	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	public User ToUser()
	{
		return new User
		{
			Id = Id,
			FullName = FullName,
			PictureUrl = PictureUrl
		};
	}
}