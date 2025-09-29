using Au5.Domain.Entities;

namespace Au5.UnitTests.Domain.Entities;

public class UserTests
{
	[Fact]
	public void ToParticipant_Should_MapUserPropertiesCorrectly()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			FullName = "Mohammad Karimi",
			PictureUrl = "http://example.com/pic.jpg",
			Email = "mha.karimi@gmail.com",
			Password = "secure",
			IsActive = true
		};

		var participant = user.ToParticipant();

		Assert.Equal(userId, participant.Id);
		Assert.Equal("Mohammad Karimi", participant.FullName);
		Assert.Equal("http://example.com/pic.jpg", participant.PictureUrl);
		Assert.Equal("mha.karimi@gmail.com", participant.Email);
	}

	[Fact]
	public void ToParticipant_Should_NotReturnNull()
	{
		var user = new User();

		var participant = user.ToParticipant();

		Assert.NotNull(participant);
	}
}
