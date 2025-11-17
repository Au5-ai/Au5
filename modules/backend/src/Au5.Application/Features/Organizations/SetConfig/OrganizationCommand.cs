namespace Au5.Application.Features.Organizations.SetConfig;

public record OrganizationCommand : IRequest<Result>
{
	public string OrganizationName { get; init; }

	public string BotName { get; init; }

 	public string Direction { get; init; }

	public string Language { get; init; }
}
