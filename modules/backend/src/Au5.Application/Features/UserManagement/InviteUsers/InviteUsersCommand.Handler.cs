using Au5.Application.Common;
using Au5.Application.Common.Options;
using Au5.Application.Dtos;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.UserManagement.InviteUsers;

public class InviteUsersCommandHandler : IRequestHandler<InviteUsersCommand, Result<InviteUsersResponse>>
{
	private readonly IApplicationDbContext _context;
	private readonly IEmailProvider _emailProvider;
	private readonly IDataProvider _dataProvider;
	private readonly ICurrentUserService _currentUser;
	private readonly OrganizationOptions _organizationOptions;

	public InviteUsersCommandHandler(
		IApplicationDbContext context,
		IEmailProvider emailProvider,
		IDataProvider dataProvider,
		IOptions<OrganizationOptions> options,
		ICurrentUserService currentUser)
	{
		_context = context;
		_emailProvider = emailProvider;
		_dataProvider = dataProvider;
		_organizationOptions = options.Value;
		_currentUser = currentUser;
	}

	public async ValueTask<Result<InviteUsersResponse>> Handle(InviteUsersCommand request, CancellationToken cancellationToken)
	{
		List<User> invited = [];
		List<string> success = [];
		Dictionary<string, string> failed = [];

		var config = await GetOrganizationConfigAsync(cancellationToken);
		if (config is null)
		{
			return Error.Unauthorized("Organization.NotConfigured", AppResources.Organization.IsNotConfigured);
		}

		var existingUsers = await GetExistingUsersAsync(request.Invites.Select(x => x.Email), cancellationToken);

		ProcessInvitations(request.Invites, existingUsers, invited, success, failed);

		var saveResult = await _context.SaveChangesAsync(cancellationToken);

		if (saveResult.IsSuccess)
		{
			await ProcessEmailInvitationsAsync(invited, config.OrganizationName, success, failed);
		}
		else
		{
			HandleSaveFailure(request.Invites, existingUsers, success, failed);
		}

		return new InviteUsersResponse { Failed = failed, Success = success };
	}

	private static void HandleSaveFailure(
		List<InviteUsersRequest> invites,
		HashSet<string> existingUsers,
		List<string> success,
		Dictionary<string, string> failed)
	{
		success.Clear();
		failed.Clear();

		foreach (var invite in invites)
		{
			var errorMessage = existingUsers.Contains(invite.Email)
				? AppResources.User.AlreadyExistsInDatabase
				: AppResources.User.FailedToSaveToDatabase;

			failed.TryAdd(invite.Email, errorMessage);
		}
	}

	private async Task<Organization> GetOrganizationConfigAsync(CancellationToken cancellationToken)
	{
		return await _context.Set<Organization>()
			.Where(x => x.Id == _currentUser.OrganizationId)
			.AsNoTracking()
			.FirstOrDefaultAsync(cancellationToken);
	}

	private async Task<HashSet<string>> GetExistingUsersAsync(IEnumerable<string> emails, CancellationToken cancellationToken)
	{
		var emailArray = emails.ToArray();
		var users = await _context.Set<User>()
			.Where(u => emailArray.Contains(u.Email))
			.Select(u => u.Email)
			.ToListAsync(cancellationToken);

		return users.ToHashSet(StringComparer.OrdinalIgnoreCase);
	}

	private void ProcessInvitations(
		List<InviteUsersRequest> invites,
		HashSet<string> existingUsers,
		List<User> invited,
		List<string> success,
		Dictionary<string, string> failed)
	{
		foreach (var userInvited in invites.Distinct())
		{
			if (existingUsers.Contains(userInvited.Email))
			{
				failed.TryAdd(userInvited.Email, AppResources.User.AlreadyExistsInDatabase);
				continue;
			}

			var user = new User
			{
				Id = _dataProvider.NewGuid(),
				Email = userInvited.Email,
				IsActive = false,
				CreatedAt = _dataProvider.Now,
				FullName = "Not Entered",
				Password = "Not Entered",
				PictureUrl = string.Empty,
				Role = userInvited.Role,
				Status = UserStatus.SendVerificationLink,
				OrganizationId = _currentUser.OrganizationId
			};

			_context.Set<User>().Add(user);
			invited.Add(user);
			success.Add(userInvited.Email);
		}
	}

	private async Task ProcessEmailInvitationsAsync(
		List<User> invited,
		string organizationName,
		List<string> success,
		Dictionary<string, string> failed)
	{
		var smtpOptions = new SmtpOptions
		{
			Host = _organizationOptions.SmtpHost,
			BaseUrl = _organizationOptions.PanelUrl,
			Password = _organizationOptions.SmtpPassword,
			Port = _organizationOptions.SmtpPort,
			User = _organizationOptions.SmtpUser,
			UseSsl = _organizationOptions.SmtpUseSSl,
			From = _organizationOptions.SmtpFrom
		};

		var emailSentResponse = await _emailProvider.SendInviteAsync(invited, organizationName, smtpOptions);

		foreach (var item in emailSentResponse)
		{
			if (item.IsEmailSent)
			{
				success.Add(item.Email);
			}
			else
			{
				failed.TryAdd(item.Email, AppResources.User.FailedToSendInvitationEmail);
			}
		}
	}
}
