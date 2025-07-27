using System.Text.Json;
using Au5.Application.Common.Abstractions;
using StackExchange.Redis;

namespace Au5.Infrastructure.Providers;

public class RedisCacheProvider : ICacheProvider
{
	private static readonly JsonSerializerOptions _jsonOptions = new()
	{
		PropertyNameCaseInsensitive = true,
		ReadCommentHandling = JsonCommentHandling.Skip,
		AllowTrailingCommas = true,
	};

	private readonly string _keyPrefix = "Au5_";

	private readonly IDatabase _db;

	public RedisCacheProvider(IConnectionMultiplexer connectionMultiplexer)
	{
		_db = connectionMultiplexer.GetDatabase();
	}

	public async Task SetAsync<T>(string key, T value, TimeSpan expiration)
	{
		if (string.IsNullOrWhiteSpace(key))
		{
			throw new ArgumentException("Cache key cannot be null, empty, or whitespace.", nameof(key));
		}

		var json = JsonSerializer.Serialize(value, _jsonOptions);
		await _db.StringSetAsync(AddPrefix(key), json, expiration);
	}

	public async Task<T?> GetAsync<T>(string key)
	{
		var value = await _db.StringGetAsync(AddPrefix(key));
		return value.IsNullOrEmpty ? default : JsonSerializer.Deserialize<T>(value!, _jsonOptions);
	}

	public async Task RemoveAsync(string key)
	{
		await _db.KeyDeleteAsync(AddPrefix(key));
	}

	public async Task<bool> ExistsAsync(string key)
	{
		return await _db.KeyExistsAsync(AddPrefix(key));
	}

	private string AddPrefix(string key) => $"{_keyPrefix}{key}";
}
