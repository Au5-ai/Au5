using System.Data;
using Au5.Application.Common;

namespace Au5.Application.Features.UserManagement.GetUserMenus;

public class GetUserMenusQueryHandler : IRequestHandler<GetUserMenusQuery, Result<List<GetUserMenusResponse>>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public GetUserMenusQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
	{
		_dbContext = context;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<List<GetUserMenusResponse>>> Handle(GetUserMenusQuery request, CancellationToken cancellationToken)
	{
		var userRole = _currentUserService.Role;
		if (userRole is null)
		{
			return Error.Forbidden("Auth.RoleNotFound", AppResources.Auth.UserRoleNotFound);
		}

		var menus = await _dbContext
			.Set<Menu>()
			.Where(m => m.IsActive && m.RoleMenus.Any(rm => rm.RoleType == userRole))
			.Include(m => m.Children)
			.OrderBy(m => m.SortOrder)
			.ToListAsync(cancellationToken);

		var topMenus = menus.Where(m => m.ParentId == null).ToList();

		return topMenus.Select(m => MapMenuToDto(m)).ToList();
	}

	private static GetUserMenusResponse MapMenuToDto(Menu menu)
	{
		return new GetUserMenusResponse
		{
			Id = menu.Id,
			Title = menu.Title,
			Url = menu.Url,
			Icon = menu.Icon,
			Badge = string.Empty,
			ShowBadge = false,
			Children = [.. menu.Children
						   .OrderBy(c => c.SortOrder)
						   .Select(c => MapMenuToDto(c))]
		};
	}
}
