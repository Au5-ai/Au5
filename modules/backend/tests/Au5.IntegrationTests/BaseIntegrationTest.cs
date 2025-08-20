using Au5.Application.Common.Abstractions;
using Au5.Infrastructure.Persistence.Context;
using Au5.IntegrationTests.TestHelpers;
using Mediator;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.IntegrationTests;

public abstract class BaseIntegrationTest : IClassFixture<IntegrationTestWebApp>
{
	private readonly IServiceScope _scope;
	private readonly IServiceProvider _serviceProvider;
	private readonly FakeHttpMessageHandler _fakeHttpHandler;

	protected BaseIntegrationTest(IntegrationTestWebApp webApp)
	{
		WebApp = webApp;
		_scope = webApp.Services.CreateScope();
		_serviceProvider = _scope.ServiceProvider;
		DbContext = _serviceProvider.GetRequiredService<ApplicationDbContext>();
		if (DbContext.Database.GetPendingMigrations().Any())
		{
			DbContext.Database.Migrate();
		}

		_fakeHttpHandler = WebApp.Services.GetRequiredService<FakeHttpMessageHandler>();
	}

	protected static Guid UserId => Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960");

	protected IntegrationTestWebApp WebApp { get; set; }

	protected ApplicationDbContext DbContext { get; set; }

	/// <summary>
	/// Gets the application mediator for sending commands/queries.
	/// </summary>
	protected ISender Mediator => _serviceProvider.GetRequiredService<ISender>();

	protected TestCurrentUserServiceFake TestCurrentUserService =>
		(TestCurrentUserServiceFake)_serviceProvider.GetRequiredService<ICurrentUserService>();

	protected void AddExceptedResponse(BaseResponseExpectation expectedResponse)
	{
		_fakeHttpHandler.AddExpectation(expectedResponse);
	}
}
