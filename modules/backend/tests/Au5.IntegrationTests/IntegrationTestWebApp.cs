using Au5.Application.Common.Abstractions;
using Au5.Infrastructure.Persistence.Context;
using Au5.IntegrationTests.TestHelpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.MsSql;

namespace Au5.IntegrationTests;

public class IntegrationTestWebApp : WebApplicationFactory<Program>, IAsyncLifetime
{
	private readonly MsSqlContainer _dbContainer;

	public IntegrationTestWebApp()
	{
		Environment.SetEnvironmentVariable("DOCKER_HOST", "unix:///run/user/1000/podman/podman.sock");

		_dbContainer = new MsSqlBuilder()
			.WithImage("mcr.microsoft.com/mssql/server:2022-latest")
			.WithPassword("P@ssw0rd")
			.Build();
	}

	public async Task InitializeAsync()
	{
		await _dbContainer.StartAsync();
	}

	public new async Task DisposeAsync()
	{
		await _dbContainer.StopAsync();
	}

	protected override void ConfigureWebHost(IWebHostBuilder builder)
	{
		builder.ConfigureTestServices(services =>
		{
			ConfigureTestDb(services);
			ConfigureTestServices(services);
		});
	}

	private void ConfigureTestServices(IServiceCollection services)
	{
		var existingCurrentUserDescriptor = services.SingleOrDefault(
			s => s.ServiceType == typeof(ICurrentUserService));

		if (existingCurrentUserDescriptor is not null)
		{
			services.Remove(existingCurrentUserDescriptor);
		}

		services.AddScoped<ICurrentUserService, TestCurrentUserServiceFake>();

		services.AddSingleton<FakeHttpClientHandler>();
		services.AddSingleton<IHttpClientFactory>(provider =>
		{
			var fakeHandler = provider.GetRequiredService<FakeHttpClientHandler>();
			return new TestHttpClientFactory(fakeHandler);
		});
	}

	private void ConfigureTestDb(IServiceCollection services)
	{
		var existingDescriptor = services.SingleOrDefault(
			s => s.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

		if (existingDescriptor is not null)
		{
			services.Remove(existingDescriptor);
		}

		services.AddDbContext<ApplicationDbContext>(options =>
				options.UseSqlServer(_dbContainer.GetConnectionString()));
	}
}
