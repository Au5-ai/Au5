using Microsoft.AspNetCore.Http;

namespace Au5.IntegrationTests.TestHelpers;

public class FakeHttpMessageHandler(IHttpContextAccessor _httpContextAccessor) : HttpMessageHandler
{
	private readonly List<BaseResponseExpectation> _availableResponses = [];

	public void AddExpectation(BaseResponseExpectation response)
	{
		_ = response ?? throw new ArgumentNullException(nameof(response));
		_availableResponses.Add(response);
	}

	protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
	{
		var address = request.RequestUri?.AbsoluteUri ?? string.Empty;

		string? testContext = null;

		if (_httpContextAccessor.HttpContext?.Request.Headers.TryGetValue("X-Test-Context", out var contextTestValues) == true)
		{
			testContext = contextTestValues.FirstOrDefault();
		}

		if (testContext is null && request.Headers.TryGetValues("X-Test-Context", out var requestTestValues))
		{
			testContext = requestTestValues.FirstOrDefault();
		}

		BaseResponseExpectation? expectedResponse = null;
		lock (_availableResponses)
		{
			expectedResponse = _availableResponses.FirstOrDefault(x =>
					x.Method == request.Method &&
					x.RequestAddress == request.RequestUri?.PathAndQuery &&
					x.TestContext == testContext);

			if (expectedResponse is null)
			{
				var allRequestRegistered = string.Join("\r\n", _availableResponses.Select(x => $"{x.Method}:{x.RequestAddress} (Context: {x.TestContext ?? "null"})"));
				var contextInfo = testContext != null ? $" with context '{testContext}'" : " (no context provided)";
				throw new InvalidOperationException($"Cannot find response for {request.Method.Method}:{address}{contextInfo}{Environment.NewLine} Current Available Requests:{Environment.NewLine}{allRequestRegistered}");
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
