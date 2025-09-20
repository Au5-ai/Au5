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

public class SmtpClientWrapper : ISmtpClientWrapper
{
	private readonly SmtpClient _client = new();

	public SmtpCapabilities Capabilities => _client.Capabilities;

	public Task ConnectAsync(string host, int port, MailKit.Security.SecureSocketOptions options, CancellationToken cancellationToken = default)
		=> _client.ConnectAsync(host, port, options, cancellationToken);

	public Task AuthenticateAsync(string user, string password, CancellationToken cancellationToken = default)
		=> _client.AuthenticateAsync(user, password, cancellationToken);

	public Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default)
		=> _client.SendAsync(message, cancellationToken);

	public Task DisconnectAsync(bool quit, CancellationToken cancellationToken = default)
		=> _client.DisconnectAsync(quit, cancellationToken);

	public void Dispose()
	    => _client.Dispose();
}
