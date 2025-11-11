namespace Au5.Application.Features.Setup.HelloAdmin;

public record HelloAdminQuery : IRequest<Result<HelloAdminResponse>>;

public record HelloAdminResponse
{
	public bool HelloFromAdmin { get; init; }
}
