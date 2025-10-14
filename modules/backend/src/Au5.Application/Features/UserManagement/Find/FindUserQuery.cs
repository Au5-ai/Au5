namespace Au5.Application.Features.UserManagement.Find;

public class FindUserQuery : IRequest<IReadOnlyCollection<Participant>>
{
	public string FullName { get; set; }

	public string Email { get; set; }
}
