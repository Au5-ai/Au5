using Au5.Application.Common.Abstractions;
using Au5.Domain.Entities;

namespace Au5.Infrastructure.Providers;

public class EmailProvider : IEmailProvider
{
	public Task SendInviteAsync(List<User> invited)
	{
		return Task.CompletedTask;
	}
}
