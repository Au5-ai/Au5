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
		InviteUsersResponse response = new() { Success = [], Failed = [] };
		var config = await _context.Set<Organization>().Where(x => x.Id == _currentUser.OrganizationId).AsNoTracking().FirstOrDefaultAsync(cancellationToken: cancellationToken);
		if (config is null)
		{
			return Error.Unauthorized("Organization.NotConfigured", AppResources.System.IsNotConfigured);
		}

		var emails = request.Invites.Select(x => x.Email).ToArray();

		var users = await _context.Set<User>().Where(u => emails.Contains(u.Email)).ToListAsync(cancellationToken);

		foreach (var userInvited in request.Invites)
		{
			var userExists = users.Any(x => x.Email == userInvited.Email);
			if (!userExists)
			{
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
				response.Success.Add(userInvited.Email);
			}
			else
			{
				response.Failed.Add(userInvited.Email);
			}
		}

		var result = await _context.SaveChangesAsync(cancellationToken);
		if (result.IsSuccess)
		{
			await _emailProvider.SendInviteAsync(invited, config.OrganizationName, new SmtpOptions()
			{
				Host = _organizationOptions.SmtpHost,
				BaseUrl = _organizationOptions.PanelUrl,
				Password = _organizationOptions.SmtpPassword,
				Port = _organizationOptions.SmtpPort,
				User = _organizationOptions.SmtpUser,
				UseSsl = _organizationOptions.SmtpUseSSl
			});
		}
		else
		{
			response.Failed.Clear();
			response.Failed.AddRange(request.Invites.Select(i => i.Email));
			response.Success.Clear();
		}

		return response;
	}
}
