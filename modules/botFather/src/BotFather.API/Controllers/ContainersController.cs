using BotFather.API.Models;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.AspNetCore.Mvc;

namespace BotFather.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContainersController : ControllerBase
{
    private readonly DockerClient _dockerClient;

    public ContainersController()
    {
        _dockerClient = new DockerClientConfiguration(
           new Uri("unix:///run/user/1000/podman/podman.sock")
        ).CreateClient();
    }

    [HttpPost("run")]
    public async Task<IActionResult> RunContainer([FromBody] RunContainerRequest request)
    {
        try
        {
            var config = new CreateContainerParameters
            {
                Image = request.ImageName,
                Env = request.Env?.Select(kv => $"{kv.Key}={kv.Value}").ToList()
            };

            var response = await _dockerClient.Containers.CreateContainerAsync(config);
            await _dockerClient.Containers.StartContainerAsync(response.ID, null);

            return Ok(new { ContainerId = response.ID });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
