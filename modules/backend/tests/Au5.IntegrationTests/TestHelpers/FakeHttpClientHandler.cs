namespace Au5.IntegrationTests.TestHelpers;

public class FakeHttpMessageHandler : HttpMessageHandler
{
	private readonly List<BaseResponseExpectation> _availableResponses = [];

	public void AddExpectation(BaseResponseExpectation response)
	{
		_ = response ?? throw new ArgumentNullException(nameof(response));
		_availableResponses.Add(response);
	}

	protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
	{
		var address = request.RequestUri?.ToString() ?? string.Empty;

		BaseResponseExpectation? expectedResponse = null;
		lock (_availableResponses)
		{
			expectedResponse = _availableResponses.FirstOrDefault(x =>
					x.Method == request.Method &&
					x.RequestAddress == address);

			if (expectedResponse is null)
			{
				var allRequestRegistered = string.Join("\r\n", _availableResponses.Select(x => $"{x.Method}:{x.RequestAddress}"));
				throw new InvalidOperationException($"Cannot find response for {request.Method.Method}:{address}{Environment.NewLine} Current Available Requests:{Environment.NewLine}{allRequestRegistered}");
			}

			if (expectedResponse is { OneTimeUse: true })
			{
				_availableResponses.Remove(expectedResponse);
			}
		}

		var response = expectedResponse.ToHttpResponseMessage(request);

		return Task.FromResult(response);
	}
}
