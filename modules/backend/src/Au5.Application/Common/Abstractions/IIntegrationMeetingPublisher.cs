namespace Au5.Application.Common.Abstractions;

public interface IIntegrationEventPublisher
{
	Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default);
}
