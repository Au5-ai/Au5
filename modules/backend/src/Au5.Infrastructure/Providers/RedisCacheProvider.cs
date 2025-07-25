using System.Text.Json;
using Au5.Application.Common.Abstractions;
using StackExchange.Redis;

namespace Au5.Infrastructure.Providers;

public class RedisCacheProvider : ICacheProvider
{
	private readonly IDatabase _db;

	public RedisCacheProvider(IConnectionMultiplexer connectionMultiplexer)
	{
		_db = connectionMultiplexer.GetDatabase();
	}

	public async Task SetAsync<T>(string key, T value, TimeSpan expiration)
	{
		var json = JsonSerializer.Serialize(value);
		await _db.StringSetAsync(key, json, expiration);
	}

	public async Task<T?> GetAsync<T>(string key)
	{
		var value = await _db.StringGetAsync(key);
		return value.IsNullOrEmpty ? default : JsonSerializer.Deserialize<T>(value!);
	}

	public async Task RemoveAsync(string key)
	{
		await _db.KeyDeleteAsync(key);
	}

	public async Task<bool> ExistsAsync(string key)
	{
		return await _db.KeyExistsAsync(key);
	}
}
