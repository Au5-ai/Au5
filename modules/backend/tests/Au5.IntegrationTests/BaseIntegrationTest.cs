using Au5.Application.Common.Abstractions;
using Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.IntegrationTests;

public abstract class BaseIntegrationTest : IClassFixture<IntegrationTestWebApp>, IDisposable
{
	private readonly IServiceScope _scope;
	private readonly IServiceProvider _serviceProvider;

	protected BaseIntegrationTest(IntegrationTestWebApp factory)
	{
		_scope = factory.Services.CreateScope();
		_serviceProvider = _scope.ServiceProvider;
		DbContext = _serviceProvider.GetRequiredService<IApplicationDbContext>();
	}

	protected IApplicationDbContext DbContext { get; set; }

	/// <summary>
	/// Gets the application mediator for sending commands/queries.
	/// </summary>
	protected ISender Mediator => _serviceProvider.GetRequiredService<ISender>();

	public void Dispose()
	{
		_scope?.Dispose();
	}
}
