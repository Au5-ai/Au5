using System.Net;
using Au5.Application.Services.Models;
using Au5.Infrastructure.Adapters;
using Au5.Infrastructure.Common;
using Microsoft.Extensions.Logging;

namespace Au5.UnitTests.Infrastructure.Adapters;

public class BotFatherAdapterTests
{
	private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
	private readonly Mock<ILogger<BotFatherAdapter>> _loggerMock;

	public BotFatherAdapterTests()
	{
		_httpClientFactoryMock = new Mock<IHttpClientFactory>();
		_loggerMock = new Mock<ILogger<BotFatherAdapter>>();
	}

	[Fact]
	public async Task CreateBotAsync_ShouldReturnSuccess_WhenHttpClientReturnsOk()
	{
		var payload = new BotPayload { BotDisplayName = "TestBot" };
		var expectedContent = "bot-created";

		var handler = new FakeHttpMessageHandler(new HttpResponseMessage
		{
			StatusCode = HttpStatusCode.OK,
			Content = new StringContent(expectedContent)
		});

		var httpClient = new HttpClient(handler);
		_httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

		var adapter = new BotFatherAdapter(_httpClientFactoryMock.Object, _loggerMock.Object);

		var result = await adapter.CreateBotAsync("http://localhost", payload, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(expectedContent, result.Data);
	}

	[Fact]
	public async Task CreateBotAsync_ShouldReturnFailure_WhenHttpClientReturnsError()
	{
		var payload = new BotPayload { BotDisplayName = "TestBot" };
		var errorMessage = "something went wrong";

		var handler = new FakeHttpMessageHandler(new HttpResponseMessage
		{
			StatusCode = HttpStatusCode.InternalServerError,
			Content = new StringContent(errorMessage)
		});

		var httpClient = new HttpClient(handler);
		_httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

		var adapter = new BotFatherAdapter(_httpClientFactoryMock.Object, _loggerMock.Object);

		var result = await adapter.CreateBotAsync("http://localhost", payload, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.FailedToAddBot, result.Error.Description);
	}

	[Fact]
	public async Task CreateBotAsync_ShouldReturnFailure_WhenExceptionThrown()
	{
		var payload = new BotPayload { BotDisplayName = "TestBot" };

		var handler = new ExceptionThrowingHandler();
		var httpClient = new HttpClient(handler);
		_httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

		var adapter = new BotFatherAdapter(_httpClientFactoryMock.Object, _loggerMock.Object);

		var result = await adapter.CreateBotAsync("http://localhost", payload, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.FailedCommunicateWithBotFather, result.Error.Description);
	}

	// --- Test Helpers ---
	private class FakeHttpMessageHandler : HttpMessageHandler
	{
		private readonly HttpResponseMessage _response;

		public FakeHttpMessageHandler(HttpResponseMessage response)
		{
			_response = response;
		}

		protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
		{
			return Task.FromResult(_response);
		}
	}

	private class ExceptionThrowingHandler : HttpMessageHandler
	{
		protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
		{
			throw new HttpRequestException("Network error");
		}
	}
}
