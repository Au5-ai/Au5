namespace Au5.Application.Features.Organizations.GetConfig;

public record OrganizationResponse
{
	public string OrganizationName { get; set; }

	public string BotName { get; set; }

	public string Direction { get; set; }

	public string Language { get; set; }
}
