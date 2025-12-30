using BotFather.Api.ContainersHostManager.DockerHost;
using BotFather.Api.ContainersHostManager.Liara;

namespace BotFather.Api;

public static class EndpointExtensions
{
    public static void MapLiaraEndpoints(this WebApplication app)
    {
        app.MapPost("/liara/create-container", async (
            BotPayload payload,
            [FromKeyedServices(nameof(LiaraContainerSerivce))] IContainerService liaraService) =>
        {
            var (success, error) = await liaraService.CreateAndStartContainerAsync(payload);

            return success
                ? Results.Ok(new
                {
                    Success = true,
                    Message = "Bot container created and deployed successfully",
                    payload.MeetId,
                    ProjectName = ContainerUtility.GenerateContainerName(payload.MeetId, payload.HashToken)
                })
                : Results.BadRequest(new
                {
                    Success = false,
                    Message = error,
                    payload.MeetId
                });
        })
        .WithName("CreateLiaraContainer")
        .WithTags("Liara");

        app.MapPost("/liara/remove-container", async (
            RemoveContainerRequest request,
            [FromKeyedServices(nameof(LiaraContainerSerivce))] IContainerService liaraService) =>
        {
            var (success, error) = await liaraService.RemoveContainerAsync(request.MeetId, request.HashToken);

            return success
                ? Results.Ok(new
                {
                    Success = true,
                    Message = "Bot container removed successfully",
                    request.MeetId
                })
                : Results.BadRequest(new
                {
                    Success = false,
                    Message = error,
                    request.MeetId
                });
        })
        .WithName("RemoveLiaraContainer")
        .WithTags("Liara");
    }

    public static void MapDockerEndpoints(this WebApplication app)
    {
        app.MapPost("/self/create-container", async (
            BotPayload payload,
            [FromKeyedServices(nameof(DockerContainerService))] IContainerService dockerService) =>
        {
            var (success, error) = await dockerService.CreateAndStartContainerAsync(payload);

            return success
                ? Results.Ok(new
                {
                    Success = true,
                    Message = "Bot container created successfully",
                    payload.MeetId,
                    ContainerName = ContainerUtility.GenerateContainerName(payload.MeetId, payload.HashToken)
                })
                : Results.BadRequest(new
                {
                    Success = false,
                    Message = error,
                    payload.MeetId
                });
        })
        .WithName("CreateDockerContainer")
        .WithTags("Docker");

        app.MapPost("/self/remove-container", async (
            RemoveContainerRequest request,
            [FromKeyedServices(nameof(DockerContainerService))] IContainerService dockerService) =>
        {
            var (success, error) = await dockerService.RemoveContainerAsync(request.MeetId, request.HashToken);

            return success
                ? Results.Ok(new
                {
                    Success = true,
                    Message = "Bot container removed successfully",
                    request.MeetId,
                    ContainerName = ContainerUtility.GenerateContainerName(request.MeetId, request.HashToken)
                })
                : Results.BadRequest(new
                {
                    Success = false,
                    Message = error,
                    request.MeetId
                });
        })
        .WithName("RemoveDockerContainer")
        .WithTags("Docker");
    }
}
