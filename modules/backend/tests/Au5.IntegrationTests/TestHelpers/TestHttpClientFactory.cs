using Microsoft.AspNetCore.Http;

namespace Au5.IntegrationTests.TestHelpers;

public class TestHttpClientFactory : IHttpClientFactory
{
	private readonly FakeHttpMessageHandler _fakeHttpMessageHandler;
	private readonly IHttpContextAccessor _httpContextAccessor;

	public TestHttpClientFactory(FakeHttpMessageHandler fakeHandler, IHttpContextAccessor httpContextAccessor)
	{
		_fakeHttpMessageHandler = fakeHandler;
		_httpContextAccessor = httpContextAccessor;
	}

	public HttpClient CreateClient(string name)
	{
		// Create a chain of handlers: TestContextHandler -> FakeHttpMessageHandler
		var testContextHandler = new TestContextHandler(_httpContextAccessor)
		{
			InnerHandler = _fakeHttpMessageHandler
		};

		// HttpClient will dispose the handler when the client is disposed
		var httpClient = new HttpClient(testContextHandler, disposeHandler: true);
		return httpClient;
	}
}
