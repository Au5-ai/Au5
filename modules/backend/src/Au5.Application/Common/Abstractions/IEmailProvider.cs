using Au5.Application.Dtos;

namespace Au5.Application.Common.Abstractions;

public interface IEmailProvider
{
	Task<IReadOnlyCollection<InviteResponse>> SendInviteAsync(IReadOnlyCollection<User> invited, string organizationName, SmtpOptions smtpOption);
}

public record InviteResponse
{
	public string Email { get; init; }
	public Guid UserId { get; init; }
	public string Link { get; init; }
	public bool IsEmailSent { get; init; }
}
