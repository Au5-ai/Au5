namespace Au5.Application.Features.UserManagement.EditUser;

public class EditUserCommand : IRequest<User>
{
	public EditUserCommand(string userId, EditUserRequest data)
	{
		UserId = userId;
		Data = data;
	}

	public string UserId { get; }

	public EditUserRequest Data { get; }
}

public class EditUserRequest
{
	// Add properties for editable user fields
}
