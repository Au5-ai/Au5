using Au5.Application.Common.Abstractions;
using Mediator;

namespace Au5.Infrastructure.Events;

public class MediatRIntegrationEventPublisher : IIntegrationEventPublisher
{
	private readonly IMediator _mediator;

	public MediatRIntegrationEventPublisher(IMediator mediator)
	{
		_mediator = mediator;
	}

	public async Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default)
	{
		await _mediator.Publish(@event, cancellationToken);
	}
}
