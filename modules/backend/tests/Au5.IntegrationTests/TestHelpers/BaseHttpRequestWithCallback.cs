using System.Net;

namespace Au5.IntegrationTests.TestHelpers;

public record HttpRequestWithJsonResponse
{
	required public HttpMethod Method { get; init; }

	required public string RequestAddress { get; init; }

	required public string ResponseContent { get; init; }

	public HttpStatusCode ResponseStatusCode { get; init; } = HttpStatusCode.OK;

    public string GetUniqueCode()
    {
        return $"{Method.Method}:{RequestAddress}";
    }
}
