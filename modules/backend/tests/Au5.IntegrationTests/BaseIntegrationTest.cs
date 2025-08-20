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
	private readonly string _testContext;

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

		// Generate unique test context for this test instance
		_testContext = $"{GetType().Name}_{Guid.NewGuid():N}";
	}

	protected static Guid UserId => Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960");

	protected IntegrationTestWebApp WebApp { get; set; }

	protected ApplicationDbContext DbContext { get; set; }

	/// <summary>
	/// Gets the test context identifier for this test instance.
	/// Use this when making HTTP requests that need to match specific test responses.
	/// </summary>
	protected string TestContext => _testContext;

	/// <summary>
	/// Gets the application mediator for sending commands/queries.
	/// </summary>
	protected ISender Mediator => _serviceProvider.GetRequiredService<ISender>();

	protected TestCurrentUserServiceFake TestCurrentUserService =>
		(TestCurrentUserServiceFake)_serviceProvider.GetRequiredService<ICurrentUserService>();

	protected void AddExceptedResponse(BaseResponseExpectation expectedResponse)
	{
		// Automatically set the test context for isolation
		expectedResponse.TestContext = _testContext;
		_fakeHttpHandler.AddExpectation(expectedResponse);
	}
}
