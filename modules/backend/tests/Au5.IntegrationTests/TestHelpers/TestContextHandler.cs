using Microsoft.AspNetCore.Http;

namespace Au5.IntegrationTests.TestHelpers;

/// <summary>
/// A delegating handler that automatically adds the X-Test-Context header to all outgoing HTTP requests.
/// </summary>
public class TestContextHandler : DelegatingHandler
{
	private readonly IHttpContextAccessor _httpContextAccessor;

	public TestContextHandler(IHttpContextAccessor httpContextAccessor)
	{
		_httpContextAccessor = httpContextAccessor;
	}

	protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
	{
		// Try to get the test context from the current HTTP context
		if (_httpContextAccessor.HttpContext?.Request.Headers.TryGetValue("X-Test-Context", out var testContextValues) == true)
		{
			var testContext = testContextValues.FirstOrDefault();
			if (!string.IsNullOrEmpty(testContext))
			{
				// Add the test context header to the outgoing request
				request.Headers.Add("X-Test-Context", testContext);
			}
		}

		return base.SendAsync(request, cancellationToken);
	}
}
