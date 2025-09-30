namespace Au5.Application.Dtos.AI;

public abstract class OpenAIRequest
{
	public string ProxyUrl { get; set; }

	public string ApiKey { get; set; }
}
