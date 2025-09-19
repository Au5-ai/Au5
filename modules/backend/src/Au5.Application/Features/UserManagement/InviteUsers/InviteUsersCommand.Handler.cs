using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.InviteUsers;

public class InviteUsersCommandHandler : IRequestHandler<InviteUsersCommand, Result<InviteUsersResponse>>
{
	private readonly IApplicationDbContext _context;
	private readonly IEmailProvider _emailProvider;

	public InviteUsersCommandHandler(IApplicationDbContext context, IEmailProvider emailProvider)
	{
		_context = context;
		_emailProvider = emailProvider;
	}

	public async ValueTask<Result<InviteUsersResponse>> Handle(InviteUsersCommand request, CancellationToken cancellationToken)
	{
		List<User> invited = [];
		InviteUsersResponse response = new() { Success = [], Failed = [] };
		var config = await _context.Set<SystemConfig>().AsNoTracking().SingleOrDefaultAsync(cancellationToken: cancellationToken);
		if (config is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		foreach (var userInvited in request.Invites)
		{
			var userExists = await _context.Set<User>().AnyAsync(u => u.Email == userInvited.Email, cancellationToken);
			if (!userExists)
			{
				var user = new User
				{
					Id = Guid.NewGuid(),
					Email = userInvited.Email,
					IsActive = false,
					CreatedAt = DateTime.Now,
					FullName = "Not Entered",
					Password = "Not Entered",
					PictureUrl = string.Empty,
					Role = userInvited.Role,
					Status = UserStatus.SendVerificationLink
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
				Host = config.SmtpHost,
				BaseUrl = config.PanelUrl,
				Password = config.SmtpPassword,
				Port = config.SmtpPort,
				User = config.SmtpUser
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
