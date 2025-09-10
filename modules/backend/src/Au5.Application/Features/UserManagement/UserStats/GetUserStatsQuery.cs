namespace Au5.Application.Features.UserManagement.UserStats;

public record GetUserStatsQuery : IRequest<UserStatsDto>;

public record UserStatsDto
{
	required public int Total { get; init; }
	required public int Active { get; init; }
	required public int Admins { get; init; }
	required public int Inactive { get; init; }
}
