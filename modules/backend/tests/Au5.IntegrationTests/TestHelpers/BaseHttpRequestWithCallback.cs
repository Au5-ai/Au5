using System.Net;

namespace Au5.IntegrationTests.TestHelpers;

public class HttpRequestWithJsonResponse
{
	required public HttpMethod Method { get; set; }

	required public string RequestAddress { get; set; }

	required public string ResponseContent { get; set; }

	public HttpStatusCode ResponseStatusCode { get; set; } = HttpStatusCode.OK;

	public HttpResponseMessage RequestCallback(HttpRequestMessage _)
	{
		return new HttpResponseMessage(ResponseStatusCode)
		{
			Content = new StringContent(ResponseContent, System.Text.Encoding.UTF8, "application/json")
		};
	}
}
