namespace BotFather.Api.ContainersHostManager.Liara.Models;

public record UpdateEnvsRequest
{
    [JsonPropertyName("project")]
    public string Project { get; init; }

    [JsonPropertyName("variables")]
    public List<EnvironmentVariable> Variables { get; init; }
}
