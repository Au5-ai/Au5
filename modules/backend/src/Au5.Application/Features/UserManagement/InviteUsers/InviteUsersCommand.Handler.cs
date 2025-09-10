using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.InviteUsers;

public class InviteUsersCommandHandler : IRequestHandler<InviteUsersCommand, InviteUsersResponse>
{
	private readonly IApplicationDbContext _context;
	private readonly IEmailProvider _emailProvider;

	public InviteUsersCommandHandler(IApplicationDbContext context, IEmailProvider emailProvider)
	{
		_context = context;
		_emailProvider = emailProvider;
	}

	public async ValueTask<InviteUsersResponse> Handle(InviteUsersCommand request, CancellationToken cancellationToken)
	{
		List<User> invited = [];
		InviteUsersResponse response = new() { Success = [], Failed = [] };

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
					PictureUrl = "Not Entered",
					Role = userInvited.Role
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
			await _emailProvider.SendInviteAsync(invited);
		}
		else
		{
			response.Failed.AddRange(request.Invites.Select(i => i.Email));
			response.Success.Clear();
		}

		return response;
	}
}
