namespace Au5.Application.Common.Abstractions;

public interface ICacheProvider
{
	Task SetAsync<T>(string key, T value, TimeSpan expiration);

	Task<T> GetAsync<T>(string key);

	Task RemoveAsync(string key);

	Task<bool> ExistsAsync(string key);
}
