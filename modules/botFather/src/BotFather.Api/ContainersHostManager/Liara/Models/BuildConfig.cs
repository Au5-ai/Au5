namespace BotFather.Api.ContainersHostManager.Liara.Models;

public record BuildConfig
{
    [JsonPropertyName("cache")]
    public bool Cache { get; init; }

    [JsonPropertyName("args")]
    public object Args { get; init; }

    [JsonPropertyName("dockerfile")]
    public string Dockerfile { get; init; }

    [JsonPropertyName("location")]
    public string Location { get; init; }
}
