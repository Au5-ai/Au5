using Au5.Application.Dtos;

namespace Au5.Application.Common.Abstractions;

public interface IEmailProvider
{
	Task<List<InviteResponse>> SendInviteAsync(List<User> invited, string organizationName, SmtpOptions smtpOption);
}

public record InviteResponse
{
	public Guid UserId { get; init; }
	public string Link { get; init; }
}
