namespace BotFather.API.Models;

public class RunContainerRequest
{
    public string ImageName { get; set; } = default!;
    public Dictionary<string, string>? Env { get; set; }
}
