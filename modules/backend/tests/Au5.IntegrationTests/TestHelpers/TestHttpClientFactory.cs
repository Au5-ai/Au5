namespace Au5.IntegrationTests.TestHelpers;

public class TestHttpClientFactory : IHttpClientFactory
{
	private readonly FakeHttpMessageHandler _fakeHttpMessageHandler;

	public TestHttpClientFactory(FakeHttpMessageHandler fakeHandler)
	{
		_fakeHttpMessageHandler = fakeHandler;
	}

	public HttpClient CreateClient(string name)
	{
		var httpClient = new HttpClient(_fakeHttpMessageHandler, disposeHandler: true);
		return httpClient;
	}
}
