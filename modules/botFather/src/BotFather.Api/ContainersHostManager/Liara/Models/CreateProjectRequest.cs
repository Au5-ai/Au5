namespace BotFather.Api.ContainersHostManager.Liara.Models;

public record CreateProjectRequest
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("platform")]
    public string Platform { get; init; }

    [JsonPropertyName("readOnlyRootFilesystem")]
    public bool ReadOnlyRootFilesystem { get; init; }

    [JsonPropertyName("network")]
    public string Network { get; init; }

    [JsonPropertyName("planID")]
    public string PlanID { get; init; }

    [JsonPropertyName("bundlePlanID")]
    public string BundlePlanID { get; init; }
}
