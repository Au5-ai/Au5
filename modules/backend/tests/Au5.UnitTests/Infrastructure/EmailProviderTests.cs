using Au5.Application.Dtos;
using Au5.Domain.Entities;
using Au5.Infrastructure.Adapters;
using Au5.Infrastructure.Providers;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Au5.UnitTests.Infrastructure;

public class EmailProviderTests
{
	private readonly Mock<ISmtpClientWrapper> _mockSmtp;
	private readonly Mock<IUrlGenerator> _urlGenerator;
	private readonly Mock<ILogger<EmailProvider>> _mockLogger;
	private readonly EmailProvider _service;
	private readonly string _organizationName = "Test Organization";

	public EmailProviderTests()
	{
		_mockSmtp = new Mock<ISmtpClientWrapper>();
		_urlGenerator = new();
		_mockLogger = new Mock<ILogger<EmailProvider>>();
		_service = new EmailProvider(_mockSmtp.Object, _urlGenerator.Object, _mockLogger.Object);
	}

	[Fact]
	public async Task SendInviteAsync_ShouldNotAuthenticateIfNoCredentialsProvided()
	{
		_mockSmtp.SetupGet(m => m.Capabilities).Returns(MailKit.Net.Smtp.SmtpCapabilities.Authentication);

		var users = new List<User>
		{
			new() { FullName = "Jane Doe", Email = "jane@example.com" }
		};

		var options = new SmtpOptions
		{
			Host = "smtp.example.com",
			Port = 25,
			User = string.Empty,       // no username
			Password = string.Empty,   // no password
			BaseUrl = "http://example.com",
			From = "from@example.com"
		};

		await _service.SendInviteAsync(users, _organizationName, options);

		_mockSmtp.Verify(m => m.AuthenticateAsync(It.IsAny<string>(), It.IsAny<string>(), default), Times.Never);
		_mockSmtp.Verify(m => m.SendAsync(It.IsAny<MimeMessage>(), default), Times.Once);
	}

	[Fact]
	public async Task SendInviteAsync_ShouldSendMultipleEmails()
	{
		_mockSmtp.SetupGet(m => m.Capabilities).Returns(MailKit.Net.Smtp.SmtpCapabilities.Authentication);

		var users = new List<User>
		{
			new() { FullName = "User One", Email = "one@example.com" },
			new() { FullName = "User Two", Email = "two@example.com" }
		};

		var options = new SmtpOptions
		{
			Host = "smtp.example.com",
			Port = 25,
			User = "user",
			Password = "pass",
			BaseUrl = "http://example.com",
			From = "from@example.com"
		};

		await _service.SendInviteAsync(users, _organizationName, options);

		_mockSmtp.Verify(m => m.SendAsync(It.IsAny<MimeMessage>(), default), Times.Exactly(2));
	}
}
