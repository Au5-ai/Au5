namespace Au5.Application.Features.SystemConfigs.SetConfig;

public record SystemConfigCommand : IRequest<Result>
{
	public string OrganizationName { get; init; }

	public string BotName { get; init; }

	public string HubUrl { get; init; }

	public string Direction { get; init; }

	public string Language { get; init; }

	public string ServiceBaseUrl { get; init; }

	public string PanelUrl { get; init; }

	public string OpenAIToken { get; init; }

	public bool ForceUpdate { get; init; } = false;
}
