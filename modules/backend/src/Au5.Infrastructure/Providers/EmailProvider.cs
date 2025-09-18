using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos;
using Au5.Domain.Entities;
using Au5.Infrastructure.Adapters;
using Au5.Shared;
using MimeKit;

namespace Au5.Infrastructure.Providers;

public class EmailProvider(ISmtpClientWrapper smtpClient) : IEmailProvider
{
	private readonly ISmtpClientWrapper _smtpClient = smtpClient;


	public async Task SendInviteAsync(List<User> invited, SmtpOptions smtpOption)
	{
		await _smtpClient.ConnectAsync(smtpOption.Host, smtpOption.Port, MailKit.Security.SecureSocketOptions.None);

		if (!string.IsNullOrWhiteSpace(smtpOption.User) &&
			!string.IsNullOrWhiteSpace(smtpOption.Password) &&
			_smtpClient.Capabilities.HasFlag(MailKit.Net.Smtp.SmtpCapabilities.Authentication))
		{
			await _smtpClient.AuthenticateAsync(smtpOption.User, smtpOption.Password);
		}

		foreach (var user in invited)
		{
			var emailBody = BuildInviteEmailBody(user, smtpOption.BaseUrl);

			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("Company Name", smtpOption.User));
			message.To.Add(new MailboxAddress(user.FullName, user.Email));
			message.Subject = "You're Invited! Please Verify Your Email";

			var builder = new BodyBuilder { HtmlBody = emailBody };
			message.Body = builder.ToMessageBody();

			await _smtpClient.SendAsync(message);
		}

		await _smtpClient.DisconnectAsync(true);
	}

	private static string BuildInviteEmailBody(User invitedUser, string verificationBaseUrl)
	{
		var verificationLink = $"{verificationBaseUrl}/verify?id={invitedUser.Id}&hash={HashHelper.HashSafe(invitedUser.Email)}";
		var companyName = "asax";
		var html = $@"<table
  width=""100%""
  border=""0""
  cellspacing=""0""
  cellpadding=""0""
  style=""width: 100% !important""
>
  <tbody>
    <tr>
      <td align=""center"">
        <table
          style=""border: 1px solid #eaeaea; border-radius: 5px; margin: 40px 0""
          width=""600""
          border=""0""
          cellspacing=""0""
          cellpadding=""40""
        >
          <tbody>
            <tr>
              <td align=""center"">
                <div
                  style=""
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                      'Droid Sans', 'Helvetica Neue', sans-serif;
                    text-align: left;
                    width: 465px;
                  ""
                >
                  <table
                    width=""100%""
                    border=""0""
                    cellspacing=""0""
                    cellpadding=""0""
                    style=""width: 100% !important""
                  >
                    <tbody>
                      <tr>
                        <td align=""center"">
                          <div>
                             <img
                              src=""https://avatars.githubusercontent.com/u/202275934?s=200&v=4""
                              width=""40""
                              height=""37""
                              alt=""Au5""
                              style=""border-radius: 6px""
                            />
                          </div>
                          <h1
                            style=""
                              color: #000;
                              font-family: -apple-system, BlinkMacSystemFont,
                                'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
                                'Cantarell', 'Fira Sans', 'Droid Sans',
                                'Helvetica Neue', sans-serif;
                              font-size: 24px;
                              font-weight: normal;
                              margin: 30px 0;
                              padding: 0;
                            ""
                          >
                            {{TITLE}}
                            <strong style=""color: #000; font-weight: bold""
                              >{{COMPANYNAME}}</strong
                            >
                          </h1>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p
                    style=""
                      color: #000;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                        'Droid Sans', 'Helvetica Neue', sans-serif;
                      font-size: 14px;
                      line-height: 24px;
                    ""
                  >
                    Hello
                    <strong style=""color: #000; font-weight: bold""
                      >{{FULLNAME}}</strong
                    >,
                  </p>
                  <p
                    style=""
                      color: #000;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                        'Droid Sans', 'Helvetica Neue', sans-serif;
                      font-size: 14px;
                      line-height: 24px;
                    ""
                  >
                    {{SUBJECT}}
                  </p>
                  <p
                    style=""
                      color: #000;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                        'Droid Sans', 'Helvetica Neue', sans-serif;
                      font-size: 14px;
                      line-height: 24px;
                    ""
                  >
                    {{DESCRIBEACTION}}
                  </p>
                  <br />

                  <div align=""center"">
                    <table
                      border=""0""
                      cellspacing=""0""
                      cellpadding=""0""
                      style=""display: inline-block""
                    >
                      <tbody>
                        <tr>
                          <td
                            align=""center""
                            bgcolor=""#000""
                            valign=""middle""
                            height=""50""
                            style=""
                              font-family: -apple-system, BlinkMacSystemFont,
                                'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
                                'Cantarell', 'Fira Sans', 'Droid Sans',
                                'Helvetica Neue', sans-serif;
                              font-size: 14px;
                              padding: 12px 24px;
                            ""
                          >
                          <a href=""{{VERIFICATIONLINK}}"" target=""_blank"" style=""color: white; text-decoration: none;"">
                              {{BUTTONTEXT}}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <br />
                  <hr
                    style=""
                      border: none;
                      border-top: 1px solid #eaeaea;
                      margin: 26px 0;
                      width: 100%;
                    ""
                  />
                  <p
                    style=""
                      color: #666666;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                        'Droid Sans', 'Helvetica Neue', sans-serif;
                      font-size: 12px;
                      line-height: 24px;
                    ""
                  >
                    {{FOOTER}}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
";

		html = html.Replace("{{TITLE}}", "Verify your email to sign in to").Replace("{{COMPANY}}", "Asax")
			.Replace("{{FULLNAME}}", "Our Coleage")
			.Replace("{{SUBJECT}}", "Welcome to Au5 platform! We're excited to have you on board.")
			.Replace("{{DESCRIBEACTION}}", "To get started, we need to verify your email address. This ensures you can receive important notifications and helps keep your account secure.\r\nPlease click the verification button below:")
			.Replace("{{VERIFICATIONLINK}}", verificationLink)
			.Replace("{{BUTTONTEXT}}", "Veify My Email")
			.Replace("{{FOOTER}}", "Having trouble?\r\nIf the button above doesn't work, please copy the entire URL below and paste it into your web browser's address bar.\r\n[" + verificationLink + "]\r\n\r\nIf you didn't request this account, no further action is required.\r\n\r\nWelcome aboard!\r\nThe Team at " + companyName);

		return html;
	}
}
