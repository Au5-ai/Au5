using System.Text.Json;
using Au5.Infrastructure.Providers;
using Microsoft.Extensions.Caching.Distributed;

namespace Au5.UnitTests.Infrastructure.Providers;
public class DistributedCacheCacheProviderTests
{
	private readonly Mock<IDistributedCache> _cacheMock;
	private readonly DistributedCacheCacheProvider _provider;

	public DistributedCacheCacheProviderTests()
	{
		_cacheMock = new Mock<IDistributedCache>();
		_provider = new DistributedCacheCacheProvider(_cacheMock.Object);
	}

	[Fact]
	public async Task Should_SetDataAndCallOnce_When_ValidArguments()
	{
		var key = "test-key";
		var value = new TestObj { Name = "Test" };
		var json = JsonSerializer.Serialize(value);
		var expiration = TimeSpan.FromMinutes(5);

		await _provider.SetAsync(key, value, expiration);

		_cacheMock.Verify(
			x => x.SetAsync(
					key,
					It.Is<byte[]>(b => Encoding.UTF8.GetString(b) == json),
					It.Is<DistributedCacheEntryOptions>(options =>
						options.AbsoluteExpirationRelativeToNow == expiration),
					It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_Throws_When_NullValue()
	{
		await Assert.ThrowsAsync<ArgumentNullException>(() =>
			_provider.SetAsync<TestObj>("key", null, TimeSpan.FromMinutes(1)));
	}

	[Theory]
	[InlineData(null)]
	[InlineData("")]
	[InlineData("   ")]
	public async Task Should_Throws_When_InvalidKey(string key)
	{
		await Assert.ThrowsAsync<ArgumentException>(() =>
			_provider.SetAsync(key, new TestObj(), TimeSpan.FromMinutes(1)));
	}

	[Fact]
	public async Task Should_ReturnsDeserializedObject_When_KeyIsValid()
	{
		var key = "test-key";
		var obj = new TestObj { Name = "Test" };
		var json = JsonSerializer.Serialize(obj);

		_cacheMock.Setup(x => x.GetAsync(key, It.IsAny<CancellationToken>()))
			 .ReturnsAsync(Encoding.UTF8.GetBytes(json));

		var result = await _provider.GetAsync<TestObj>(key);

		Assert.NotNull(result);
		Assert.Equal("Test", result.Name);
	}

	[Fact]
	public async Task Should_CallsRemoveAsync_When_ValidKey()
	{
		var key = "test-key";
		await _provider.RemoveAsync(key);
		_cacheMock.Verify(x => x.RemoveAsync(key, It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnsTrue_When_KeyExists()
	{
		var key = "exists";
		_cacheMock.Setup(x => x.GetAsync(key, It.IsAny<CancellationToken>()))
			 .ReturnsAsync(Encoding.UTF8.GetBytes("Value"));

		var exists = await _provider.ExistsAsync(key);

		Assert.True(exists);
	}

	[Fact]
	public async Task Should_ReturnsFalse_When_KeyDoesNotExist()
	{
		var key = "not-exist";
		_cacheMock.Setup(x => x.GetAsync(key, It.IsAny<CancellationToken>()))
			 .ReturnsAsync(Encoding.UTF8.GetBytes(string.Empty));

		var exists = await _provider.ExistsAsync(key);

		Assert.False(exists);
	}

	private class TestObj
	{
		public string Name { get; set; }
	}
}
