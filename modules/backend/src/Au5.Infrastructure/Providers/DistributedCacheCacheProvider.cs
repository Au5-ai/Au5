using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Microsoft.Extensions.Caching.Distributed;

namespace Au5.Infrastructure.Providers;

public class DistributedCacheCacheProvider : ICacheProvider
{
	private static readonly JsonSerializerOptions _jsonOptions = new()
	{
		PropertyNameCaseInsensitive = true,
		ReadCommentHandling = JsonCommentHandling.Skip,
		AllowTrailingCommas = true
	};

	private readonly IDistributedCache _cache;

	public DistributedCacheCacheProvider(IDistributedCache cache)
	{
		_cache = cache ?? throw new ArgumentNullException(nameof(cache));
	}

	public async Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default)
	{
		ValidateKey(key);
		ArgumentNullException.ThrowIfNull(value, nameof(value));

		var json = JsonSerializer.Serialize(value, _jsonOptions);
		var options = new DistributedCacheEntryOptions
		{
			AbsoluteExpirationRelativeToNow = expiration
		};

		await _cache.SetStringAsync(key, json, options, cancellationToken);
	}

	public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
	{
		ValidateKey(key);

		var json = await _cache.GetStringAsync(key, cancellationToken);
		return string.IsNullOrEmpty(json)
			? default
			: JsonSerializer.Deserialize<T>(json, _jsonOptions);
	}

	public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
	{
		ValidateKey(key);
		await _cache.RemoveAsync(key, cancellationToken);
	}

	public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
	{
		ValidateKey(key);

		var value = await _cache.GetStringAsync(key, cancellationToken);
		return !string.IsNullOrEmpty(value);
	}

	private static void ValidateKey(string key)
	{
		if (string.IsNullOrWhiteSpace(key))
		{
			throw new ArgumentException("Cache key cannot be null, empty, or whitespace.", nameof(key));
		}
	}
}
