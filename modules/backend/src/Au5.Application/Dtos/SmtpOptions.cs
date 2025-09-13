namespace Au5.Application.Dtos;

public record SmtpOptions
{
	public string Host { get; init; }
	public int Port { get; init; }
	public string User { get; init; }
	public string Password { get; init; }
	public string BaseUrl { get; init; }

}
