using System.Net;

namespace Au5.IntegrationTests.TestHelpers;

public abstract class BaseResponseExpectation
{
	required public HttpMethod Method { get; init; }

	required public string RequestAddress { get; init; }

	public HttpStatusCode ResponseStatusCode { get; init; } = HttpStatusCode.OK;

	public bool OneTimeUse { get; set; } = true;

	/// <summary>
	/// Gets or sets the test context identifier to isolate responses per test case.
	/// </summary>
	public string? TestContext { get; set; }

	public abstract HttpResponseMessage ToHttpResponseMessage(HttpRequestMessage request);
}
