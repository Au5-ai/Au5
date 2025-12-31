namespace BotFather.Api.ContainersHostManager.Liara.Models;

public record DeployRequest
{
    [JsonPropertyName("build")]
    public BuildConfig Build { get; init; }

    [JsonPropertyName("cron")]
    public List<object> Cron { get; init; }

    [JsonPropertyName("args")]
    public List<object> Args { get; init; }

    [JsonPropertyName("port")]
    public int Port { get; init; }

    [JsonPropertyName("type")]
    public string Type { get; init; }

    [JsonPropertyName("disks")]
    public List<object> Disks { get; init; }

    [JsonPropertyName("image")]
    public string Image { get; init; }
}
