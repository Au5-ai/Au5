namespace Au5.Application.Features.Reactions.GetAllQuery;

public sealed record GetAllReactionsQuery() : IRequest<IReadOnlyCollection<Reaction>>;
