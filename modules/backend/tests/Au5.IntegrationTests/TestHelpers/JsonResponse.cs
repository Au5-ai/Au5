using System.Net.Http.Json;

namespace Au5.IntegrationTests.TestHelpers;

public class JsonResponse : BaseResponseExpectation
{
	required public string ExpectedResponse { get; init; }

	public override HttpResponseMessage ToHttpResponseMessage(HttpRequestMessage request)
	{
		if (!string.IsNullOrEmpty(ExpectedRequest))
		{
			var actualContent = request.Content?.ReadAsStringAsync().Result;
			Assert.Equal(actualContent, ExpectedRequest);
		}

		var response = new HttpResponseMessage(ResponseStatusCode)
		{
			StatusCode = ResponseStatusCode,
			Content = JsonContent.Create(ExpectedResponse)
		};

		return response;
	}
}
