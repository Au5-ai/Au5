using System.Net;

namespace Au5.Shared;

public readonly record struct Error
{
	private Error(string code, string description, HttpStatusCode type)
	{
		Code = code;
		Description = description;
		Type = type;
	}

	public string Code { get; }

	public string Description { get; }

	public HttpStatusCode Type { get; }

	public static Error Failure(string description = "A failure has occurred.")
		=> new("General.Failure", description, HttpStatusCode.InternalServerError);

	public static Error Failure(string code = "General.Failure", string description = "A failure has occurred.")
		=> new(code, description, HttpStatusCode.InternalServerError);

	public static Error Validation(string code = "General.Validation", string description = "A validation error has occurred.")
		=> new(code, description, HttpStatusCode.BadRequest);

	public static Error NotFound(string code = "General.NotFound", string description = "A 'Not Found' error has occurred.")
		=> new(code, description, HttpStatusCode.NotFound);

	public static Error Unauthorized(string code = "General.Unauthorized", string description = "An 'Unauthorized' error has occurred.")
		=> new(code, description, HttpStatusCode.Unauthorized);

	public static Error Forbidden(string code = "General.Forbidden", string description = "A 'Forbidden' error has occurred.")
		=> new(code, description, HttpStatusCode.Forbidden);

	public static Error BadRequest(string code = "General.BadRequest", string description = "A 'BadRequest' error has occurred.")
		=> new(code, description, HttpStatusCode.BadRequest);
}
