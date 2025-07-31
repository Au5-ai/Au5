using Au5.Infrastructure.Persistence.Context;
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
		builder.ConfigureTestServices(ConfigureTestDb);
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
