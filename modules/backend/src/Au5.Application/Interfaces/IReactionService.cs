namespace Au5.Application.Interfaces;

public interface IReactionService
{
	Task<IReadOnlyCollection<Reaction>> GetAllAsync(CancellationToken ct = default);
}
