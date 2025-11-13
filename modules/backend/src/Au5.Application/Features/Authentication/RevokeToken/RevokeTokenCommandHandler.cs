namespace Au5.Application.Features.Authentication.RevokeToken;

public sealed class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;

	public RevokeTokenCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
	{
		var user = await _dbContext.Set<User>()
			.FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken && u.IsActive, cancellationToken);

		if (user != null)
		{
			user.RevokeRefreshToken();
			await _dbContext.SaveChangesAsync(cancellationToken);
		}

		// Always return success even if token wasn't found (security best practice)
		return Result.Success();
	}
}
