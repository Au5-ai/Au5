using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos;
using Au5.Domain.Entities;
using Au5.Infrastructure.Adapters;
using Au5.Shared;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Au5.Infrastructure.Providers;

public class EmailProvider(ISmtpClientWrapper smtpClient, ILogger<EmailProvider> logger) : IEmailProvider
{
	private readonly ISmtpClientWrapper _smtpClient = smtpClient;

	public async Task SendInviteAsync(List<User> invited, string organizationName, SmtpOptions smtpOption)
	{
		try
		{
			var secureSocketOptions = smtpOption.UseSsl ?
							  MailKit.Security.SecureSocketOptions.StartTls :
							  MailKit.Security.SecureSocketOptions.None;

			await _smtpClient.ConnectAsync(smtpOption.Host, smtpOption.Port, secureSocketOptions);

			if (!string.IsNullOrWhiteSpace(smtpOption.User) &&
				!string.IsNullOrWhiteSpace(smtpOption.Password) &&
				_smtpClient.Capabilities.HasFlag(MailKit.Net.Smtp.SmtpCapabilities.Authentication))
			{
				await _smtpClient.AuthenticateAsync(smtpOption.User, smtpOption.Password);
			}

			foreach (var user in invited)
			{
				var emailBody = BuildInviteEmailBody(user, smtpOption.BaseUrl, organizationName);

				var message = new MimeMessage();

				message.From.Add(new MailboxAddress(organizationName, smtpOption.User));
				message.To.Add(MailboxAddress.Parse(user.Email));

				message.Subject = "You're Invited! Please Verify Your Email";

				var builder = new BodyBuilder { HtmlBody = emailBody };
				message.Body = builder.ToMessageBody();

				await _smtpClient.SendAsync(message);
			}

			await _smtpClient.DisconnectAsync(true);
		}
		catch (Exception ex)
		{
			logger.LogInformation(message: ex.Message);
		}
	}

	private static string BuildInviteEmailBody(User invitedUser, string verificationBaseUrl, string companyName)
	{
		ArgumentNullException.ThrowIfNull(invitedUser);

		var verificationLink = $"{verificationBaseUrl}/exConfig?id={invitedUser.Id}&hash={HashHelper.HashSafe(invitedUser.Email)}";
		var au5LogoUrl = "https://avatars.githubusercontent.com/u/202275934?s=200&v=4";

		var html = $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
<meta charset=""UTF-8"">
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
<title>Invitation to Join AU5</title>
</head>
<body style=""margin:0; padding:0; background-color:#f4f6f8; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""padding:40px 0;"">
    <tr>
      <td align=""center"">
        <table width=""100%"" max-width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);"">
          <tr>
            <td align=""center"" style=""padding:40px 20px;"">
              <!-- Logo -->
              <img src=""{au5LogoUrl}"" alt=""AU5 Logo"" width=""40"" height=""37"" style=""border-radius:6px; display:block; margin-bottom:20px;"">

              <!-- Heading -->
              <h1 style=""font-size:24px; margin:0 0 20px; color:#000; line-height:1.3;"">
                You've been invited to <strong>AU5</strong> by {companyName}!
              </h1>

              <!-- Greeting -->
              <p style=""font-size:14px; line-height:1.6; color:#000; margin:0 0 15px;"">
                Step inside – your invitation is here,
              </p>

              <!-- Body text -->
              <p style=""font-size:14px; line-height:1.6; color:#000; margin:0 0 15px;"">
                Welcome! You've been invited to join the AU5 platform by <strong>{companyName}</strong>. We're excited to have you on board.
              </p>

              <p style=""font-size:14px; line-height:1.6; color:#000; margin:0 0 25px;"">
                Please verify your email to log in to AU5 and unlock all its features.
                By verifying, you’ll gain AI-powered control over your meetings and make the most of the platform.
              </p>

              <!-- Button -->
              <table cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:0 auto 25px;"">
                <tr>
                  <td align=""center"" bgcolor=""#4CAF50"" style=""border-radius:5px;background-color: #2f2f2f;"">
                    <a href=""{verificationLink}"" target=""_blank"" style=""display:inline-block; padding:15px 25px; font-size:14px; color:#fff; text-decoration:none; font-weight:bold;"">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style=""font-size:12px; color:#666; line-height:1.6; margin:0 0 25px;"">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href=""{verificationLink}"" style=""color: #381dc6;text-decoration: none;"">Click Here</a>
              </p>

              <hr style=""border:none; border-top:1px solid #eaeaea; margin:26px 0;"">

              <!-- Footer -->
              <p style=""font-size:12px; color:#666; line-height:1.6; margin:0;"">
                If you didn't request this account, no further action is required.<br>
                Welcome aboard!<br>
                The Team at {companyName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
";

		return html;
	}
}
