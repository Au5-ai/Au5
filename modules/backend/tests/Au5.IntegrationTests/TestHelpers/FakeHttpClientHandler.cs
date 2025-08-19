using System.Collections.Concurrent;

namespace Au5.IntegrationTests.TestHelpers;

public class FakeHttpClientHandler : HttpMessageHandler
{
    private readonly ConcurrentBag<HttpRequestWithJsonResponse> _availableRequests = [];
    private readonly ConcurrentBag<(string, HttpRequestMessage)> _callHistory = [];

    public IEnumerable<(string UniqueCode, HttpRequestMessage Request)> CallHistory => _callHistory;

    public void AddExpectation(HttpRequestWithJsonResponse request)
    {
        _ = request ?? throw new ArgumentNullException(nameof(request));
        _availableRequests.Add(request);
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

        HttpRequestWithJsonResponse? findedRequest = null;
        findedRequest = _availableRequests
                .FirstOrDefault(x => x.Method == request.Method && x.RequestAddress == address);

        // TODO: we can add more functionality
        if (findedRequest is null)
        {
            var allRequestRegistered = string.Join("\r\n", _availableRequests.Select(x => $"{x.Method}:{x.RequestAddress}"));
            throw new InvalidOperationException($"Cannot find response for {request.Method.Method}:{address}{Environment.NewLine} Current Available Requests:{Environment.NewLine}{allRequestRegistered}");
        }

        _callHistory.Add((findedRequest.GetUniqueCode(), request));
        return new HttpResponseMessage(findedRequest.ResponseStatusCode)
        {
            Content = new StringContent(findedRequest.ResponseContent, System.Text.Encoding.UTF8, "application/json")
        };
    }
}
