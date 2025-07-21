namespace Au5.Application.Features.Reactions.GetAllReactionsQuery;

public sealed record GetAllReactionsQuery() : IRequest<IReadOnlyCollection<Reaction>>;
