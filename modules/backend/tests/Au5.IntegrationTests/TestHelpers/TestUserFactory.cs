using Au5.Domain.Common;
using Au5.Domain.Entities;

namespace Au5.IntegrationTests.TestHelpers;

public static class TestUserFactory
{
	public static User Create(
		string fullName,
		string email,
		DateTime createdAt,
		string password = "FakePassword1!",
		bool isActive = true,
		RoleTypes role = RoleTypes.User,
		UserStatus status = UserStatus.CompleteSignUp,
		string pictureUrl = " ")
	{
		return new User
		{
			Id = Guid.NewGuid(),
			FullName = fullName,
			Email = email,
			Password = password,
			IsActive = isActive,
			Role = role,
			Status = status,
			PictureUrl = pictureUrl,
			CreatedAt = createdAt,
			Meetings = [],
			UserSpaces = [],
			MeetingSpaces = []
		};
	}
}
