namespace Au5.Application.Common.Abstractions;

public interface IEmailProvider
{
	Task SendInviteAsync(List<User> invited);
}
