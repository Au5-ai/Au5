namespace Au5.IntegrationTests.TestHelpers;

public class FakeHttpClientHandler : HttpMessageHandler
{
	private readonly List<HttpRequestWithJsonResponse> _availableRequests = [];

	public void AddExpectation(HttpRequestWithJsonResponse request)
	{
		_ = request ?? throw new ArgumentNullException(nameof(request));

		lock (_availableRequests)
		{
			_availableRequests.Add(request);
		}
	}

	protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
	{
		var address = request.RequestUri?.AbsoluteUri ?? string.Empty;

		// unused
		var requestBody = string.Empty;
		if (request.Content is not null)
		{
			requestBody = await request.Content.ReadAsStringAsync(cancellationToken);
		}

		HttpRequestWithJsonResponse? expectedResponse = null;

		lock (_availableRequests)
		{
			expectedResponse = _availableRequests
				.FirstOrDefault(x => x.Method == request.Method && x.RequestAddress == address);

			// TODO: we can add more functionality
		}

		if (expectedResponse is null)
		{
			var findedRequest = string.Join("\r\n", _availableRequests
				.Select(x => $"{x.Method}:{x.RequestAddress}"));
			throw new InvalidOperationException($"Cannot find response for {request.Method.Method}:{address}\r\nCurrent list:\r\n{findedRequest}");
		}

		var response = expectedResponse.RequestCallback(request);
		return response;
	}
}
