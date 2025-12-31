namespace BotFather.Api.ContainersHostManager.Liara.Models;

public record EnvironmentVariable
{
    [JsonPropertyName("key")]
    public string Key { get; init; }

    [JsonPropertyName("value")]
    public string Value { get; init; }
}
