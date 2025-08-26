namespace Au5.Application.Features.Administration.HelloAdmin;

public record HelloAdminQuery : IRequest<Result<HelloAdminResponse>>;

public record HelloAdminResponse
{
	public bool HelloFromAdmin { get; init; }
}
