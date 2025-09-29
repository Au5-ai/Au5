namespace Au5.Application.Features.SystemConfigs.ExtensionConfig;

public record ExtensionConfigResponse
{
	public string BotName { get; init; }

	public string HubUrl { get; init; }

	public string Direction { get; init; }

	public string Language { get; init; }

	public string ServiceBaseUrl { get; init; }

	public string PanelUrl { get; init; }
}
