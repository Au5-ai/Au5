using BotFather.Api.Models;
using BotFather.Api.Options;
using BotFather.Shared;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace BotFather.Api.ContainersHostManager.DockerHost;

public class DockerContainerService : IContainerService
{
    private static readonly JsonSerializerOptions _cachedJsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly ContainerOptions _containerOptions;
    private readonly ILogger<DockerContainerService> _logger;

    public DockerContainerService(IOptions<ContainerOptions> containerOptions, ILogger<DockerContainerService> logger)
    {
        _containerOptions = containerOptions.Value ?? throw new InvalidOperationException("Container options are not configured");
        _logger = logger;
    }

    private DockerClient CreateDockerClient()
    {
        var dockerUrl = Environment.GetEnvironmentVariable("DOCKER_HOST") ?? "npipe://./pipe/docker_engine";

        if (OperatingSystem.IsLinux())
        {
            dockerUrl = "unix:///var/run/docker.sock";
        }

        return new DockerClientConfiguration(new Uri(dockerUrl)).CreateClient();
    }

    public async Task<(bool Success, string Error)> CreateAndStartContainerAsync(BotPayload config)
    {
        using var client = CreateDockerClient();

        var botImage = _containerOptions.BotImage;
        var containerName = ContainerUtility.GenerateContainerName(config.MeetId, config.HashToken);

        var meetingConfigJson = JsonSerializer.Serialize(config, _cachedJsonSerializerOptions);

        _logger.LogInformation("Creating container {ContainerName} with image {BotImage}", containerName, botImage);

        var createParams = new CreateContainerParameters
        {
            Image = botImage,
            Name = containerName,
            Env =
            [
                $"MEETING_CONFIG={meetingConfigJson}"
            ],
            HostConfig = new HostConfig
            {
                RestartPolicy = new RestartPolicy
                {
                    Name = RestartPolicyKind.No
                }
            }
        };

        var response = await client.Containers.CreateContainerAsync(createParams);

        _logger.LogInformation("Starting container {ContainerId}", response.ID);

        await client.Containers.StartContainerAsync(response.ID, new ContainerStartParameters());

        _logger.LogInformation("Container {ContainerId} started successfully", response.ID);

        return (true, null);
    }

    public async Task<(bool Success, string Error)> RemoveContainerAsync(string meetId, string hashToken)
    {
        using var client = CreateDockerClient();

        var containerName = ContainerUtility.GenerateContainerName(meetId, hashToken);

        _logger.LogInformation("Attempting to stop container {ContainerName}", containerName);

        try
        {
            await client.Containers.StopContainerAsync(containerName, new ContainerStopParameters
            {
                WaitBeforeKillSeconds = 10
            });
            _logger.LogInformation("Container {ContainerName} stopped", containerName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to stop container {ContainerName}, will attempt force removal", containerName);
        }

        _logger.LogInformation("Removing container {ContainerName}", containerName);

        await client.Containers.RemoveContainerAsync(containerName, new ContainerRemoveParameters
        {
            Force = true,
            RemoveVolumes = true
        });

        _logger.LogInformation("Container {ContainerName} removed successfully", containerName);

        return (true, null);
    }
}
