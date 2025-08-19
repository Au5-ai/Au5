namespace Au5.IntegrationTests.TestHelpers;

public class TestHttpClientFactory : IHttpClientFactory
{
	private readonly FakeHttpClientHandler _fakeHttpClientHandler;

	public TestHttpClientFactory(FakeHttpClientHandler fakeHandler)
	{
		_fakeHttpClientHandler = fakeHandler;
	}

	public HttpClient CreateClient(string name)
	{
		return new HttpClient(_fakeHttpClientHandler, disposeHandler: false);
	}
}
