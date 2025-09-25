using Au5.Application.Common;
using Au5.Application.Dtos;

namespace Au5.Application.Features.UserManagement.ResendVerificationEmail;

public class ResendVerificationEmailCommandHandler : IRequestHandler<ResendVerificationEmailCommand, Result<ResendVerificationEmailResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IEmailProvider _emailProvider;

	public ResendVerificationEmailCommandHandler(
		IApplicationDbContext dbContext,
		IEmailProvider emailSender)
	{
		_dbContext = dbContext;
		_emailProvider = emailSender;
	}

	public async ValueTask<Result<ResendVerificationEmailResponse>> Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.AsNoTracking()
			.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

		if (user is null)
		{
			return Error.BadRequest(description: AppResources.User.UserNotFound);
		}

		if (user.IsRegistered())
		{
			return Error.BadRequest(description: AppResources.User.EmailAlreadyVerified);
		}

		var config = await _dbContext.Set<SystemConfig>().AsNoTracking().FirstOrDefaultAsync(cancellationToken: cancellationToken);
		if (config is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		var response = await _emailProvider.SendInviteAsync([user], config.OrganizationName, new SmtpOptions()
		{
			Host = config.SmtpHost,
			BaseUrl = config.PanelUrl,
			Password = config.SmtpPassword,
			Port = config.SmtpPort,
			User = config.SmtpUser,
			UseSsl = config.SmtpUseSSl
		});

		return (response is null || response.Count is 0) ? Error.Failure(description: AppResources.System.FailedToSMTPConnection) : new ResendVerificationEmailResponse(response.First().Link);
	}
}
