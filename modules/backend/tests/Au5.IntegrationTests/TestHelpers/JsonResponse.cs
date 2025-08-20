using System.Net.Http.Json;

namespace Au5.IntegrationTests.TestHelpers;

public class JsonResponse : BaseResponseExpectation
{
	required public string ResponseContent { get; init; }

	public override HttpResponseMessage ToHttpResponseMessage(HttpRequestMessage request)
	{
		var response = new HttpResponseMessage(ResponseStatusCode)
		{
			StatusCode = ResponseStatusCode,
			Content = JsonContent.Create(ResponseContent)
		};

		return response;
	}
}
