using Au5.Application.Common;
using Au5.Application.Common.Options;
using Au5.Application.Common.Utils;
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
		List<InvitationResult> results = [];
		List<User> usersToInvite = [];

		var config = await GetOrganizationConfigAsync(cancellationToken);
		if (config is null)
		{
			return Error.Unauthorized("Organization.NotConfigured", AppResources.Organization.IsNotConfigured);
		}

		var existingUsers = await GetExistingUsersAsync(request.Invites.Select(x => x.Email), cancellationToken);

		ProcessInvitations(request.Invites, existingUsers, usersToInvite, results);

		var saveResult = await _context.SaveChangesAsync(cancellationToken);

		if (saveResult.IsSuccess)
		{
			await ProcessEmailInvitationsAsync(usersToInvite, config.OrganizationName, results);
		}
		else
		{
			UpdateResultsForSaveFailure(results);
		}

		return new InviteUsersResponse { Results = results };
	}

	private static void UpdateResultsForSaveFailure(List<InvitationResult> results)
	{
		for (var i = 0; i < results.Count; i++)
		{
			var result = results[i];
			if (!result.AlreadyExists)
			{
				results[i] = new InvitationResult
				{
					Email = result.Email,
					StoredInDatabase = false,
					EmailSent = false,
					AlreadyExists = false,
					ErrorMessage = AppResources.User.FailedToSaveToDatabase
				};
			}
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
		List<User> usersToInvite,
		List<InvitationResult> results)
	{
		foreach (var userInvited in invites.DistinctBy(i => i.Email))
		{
			if (existingUsers.Contains(userInvited.Email))
			{
				results.Add(new InvitationResult
				{
					Email = userInvited.Email,
					StoredInDatabase = false,
					EmailSent = false,
					AlreadyExists = true,
					ErrorMessage = AppResources.User.AlreadyExistsInDatabase
				});
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
				PictureUrl = GravatarHelper.GetGravatarUrl(userInvited.Email),
				Role = userInvited.Role,
				Status = UserStatus.SendVerificationLink,
				OrganizationId = _currentUser.OrganizationId
			};

			_context.Set<User>().Add(user);
			usersToInvite.Add(user);
			results.Add(new InvitationResult
			{
				Email = userInvited.Email,
				StoredInDatabase = true,
				EmailSent = false,
				AlreadyExists = false,
				ErrorMessage = null
			});
		}
	}

	private async Task ProcessEmailInvitationsAsync(
		List<User> usersToInvite,
		string organizationName,
		List<InvitationResult> results)
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

		var emailSentResponse = await _emailProvider.SendInviteAsync(usersToInvite, organizationName, smtpOptions);

		var emailResponseMap = emailSentResponse.ToDictionary(r => r.Email, StringComparer.OrdinalIgnoreCase);

		for (var i = 0; i < results.Count; i++)
		{
			var result = results[i];
			if (result.StoredInDatabase && emailResponseMap.TryGetValue(result.Email, out var emailResult))
			{
				results[i] = new InvitationResult
				{
					Email = result.Email,
					StoredInDatabase = result.StoredInDatabase,
					EmailSent = emailResult.IsEmailSent,
					AlreadyExists = result.AlreadyExists,
					ErrorMessage = emailResult.IsEmailSent ? null : AppResources.User.FailedToSendInvitationEmail
				};
			}
		}
	}
}
