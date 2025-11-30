using Au5.Application.Common;
using Au5.Application.Common.Options;
using Au5.Application.Dtos;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.UserManagement.ResendVerificationEmail;

public class ResendVerificationEmailCommandHandler : IRequestHandler<ResendVerificationEmailCommand, Result<ResendVerificationEmailResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IEmailProvider _emailProvider;
	private readonly OrganizationOptions _organizationOptions;

	public ResendVerificationEmailCommandHandler(
		IApplicationDbContext dbContext,
		IEmailProvider emailSender,
		IOptions<OrganizationOptions> organizationOptions)
	{
		_dbContext = dbContext;
		_emailProvider = emailSender;
		_organizationOptions = organizationOptions.Value;
	}

	public async ValueTask<Result<ResendVerificationEmailResponse>> Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.AsNoTracking()
			.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

		if (user is null)
		{
			return Error.BadRequest("User.NotFound", AppResources.User.UserNotFound);
		}

		if (user.IsRegistered())
		{
			return Error.BadRequest("User.AlreadyVerified", AppResources.User.EmailAlreadyVerified);
		}

		var config = await _dbContext.Set<Organization>()
			.AsNoTracking()
			.FirstOrDefaultAsync(o => o.Id == user.OrganizationId, cancellationToken: cancellationToken);

		if (config is null)
		{
			return Error.Failure("Organization.NotConfigured", AppResources.System.IsNotConfigured);
		}

		var response = await _emailProvider.SendInviteAsync([user], config.OrganizationName, new SmtpOptions()
		{
			Host = _organizationOptions.SmtpHost,
			BaseUrl = _organizationOptions.PanelUrl,
			Password = _organizationOptions.SmtpPassword,
			Port = _organizationOptions.SmtpPort,
			User = _organizationOptions.SmtpUser,
			UseSsl = _organizationOptions.SmtpUseSSl,
			From = _organizationOptions.SmtpFrom
		});

		return (response is null || response.Count is 0) ? Error.Failure("Email.FailedToSend", AppResources.System.FailedToSMTPConnection) : new ResendVerificationEmailResponse(response.First().Link);
	}
}
