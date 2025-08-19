namespace Au5.Application.Common.Abstractions;

public interface ICacheProvider
{
	Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken ct = default);

	Task<T> GetAsync<T>(string key, CancellationToken ct = default);

	Task RemoveAsync(string key, CancellationToken ct = default);

	Task<bool> ExistsAsync(string key, CancellationToken ct = default);
}
