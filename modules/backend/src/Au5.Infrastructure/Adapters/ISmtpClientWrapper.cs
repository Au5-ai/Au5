using MailKit.Net.Smtp;
using MimeKit;

namespace Au5.Infrastructure.Adapters;

public interface ISmtpClientWrapper : IDisposable
{
	SmtpCapabilities Capabilities { get; }

	Task ConnectAsync(string host, int port, MailKit.Security.SecureSocketOptions options, CancellationToken cancellationToken = default);

	Task AuthenticateAsync(string user, string password, CancellationToken cancellationToken = default);

	Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default);

	Task DisconnectAsync(bool quit, CancellationToken cancellationToken = default);
}
