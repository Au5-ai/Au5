using System.Net;

namespace Au5.IntegrationTests.TestHelpers;

public abstract class BaseResponseExpectation
{
	public string ExpectedRequest { get; set; } = string.Empty;

	required public HttpMethod Method { get; init; }

	required public string RequestAddress { get; init; }

	public HttpStatusCode ResponseStatusCode { get; init; } = HttpStatusCode.OK;

	public bool OneTimeUse { get; set; } = true;

	public abstract HttpResponseMessage ToHttpResponseMessage(HttpRequestMessage request);
}
