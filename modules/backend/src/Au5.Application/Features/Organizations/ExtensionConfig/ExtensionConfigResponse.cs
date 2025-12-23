namespace Au5.Application.Features.Organizations.ExtensionConfig;

public record ExtensionConfigResponse
{
	public Participant User { get; init; }
	public Service Service { get; init; }
}

public record Service
{
	public string HubUrl { get; init; }

	public string Direction { get; init; }

	public string Language { get; init; }

	public string ServiceBaseUrl { get; init; }

	public string PanelUrl { get; init; }
}
