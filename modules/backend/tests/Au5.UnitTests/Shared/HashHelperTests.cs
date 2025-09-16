using Au5.Shared;

namespace Au5.UnitTests.Shared;

public class HashHelperTests
{
	[Fact]
	public void Should_ReturnSameHash_When_SamePasswordAndSalt()
	{
		var password = "MySecret123";
		var salt = Guid.NewGuid();

		var hash1 = HashHelper.HashPassword(password, salt);
		var hash2 = HashHelper.HashPassword(password, salt);

		Assert.Equal(hash1, hash2);
	}

	[Fact]
	public void Should_ReturnHash_When_SamePasswordAndSalt()
	{
		var password = "!qaz@wsx";
		var salt = Guid.Parse("edada1f7-cbda-4c13-8504-a57fe72d5960");

		var hash1 = HashHelper.HashPassword(password, salt);
		Assert.Equal("0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA=", hash1);
	}

	[Fact]
	public void Should_ReturnDifferentHash_When_DifferentPassword()
	{
		var salt = Guid.NewGuid();

		var hash1 = HashHelper.HashPassword("Password1", salt);
		var hash2 = HashHelper.HashPassword("Password2", salt);

		Assert.NotEqual(hash1, hash2);
	}

	[Fact]
	public void Should_ReturnDifferentHash_When_DifferentSalt()
	{
		var password = "SamePassword";

		var hash1 = HashHelper.HashPassword(password, Guid.NewGuid());
		var hash2 = HashHelper.HashPassword(password, Guid.NewGuid());

		Assert.NotEqual(hash1, hash2);
	}

	[Fact]
	public void Should_ReturnBase64String()
	{
		var password = "test";
		var salt = Guid.NewGuid();

		var hash = HashHelper.HashPassword(password, salt);

		var bytes = Convert.FromBase64String(hash);
		Assert.NotEmpty(bytes);
	}
}
