using Au5.Application.Features.Assistants.GetAll;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Assistants;
public class GetAssistantsQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnDefaultAssistants_When_RoleIsAdmin()
	{
		var adminId = Guid.NewGuid();
		var assistants = new List<Assistant>
				{
					new() { Id = Guid.NewGuid(), Name = "A1", IsActive = true, IsDefault = true, UserId = Guid.NewGuid() },
					new() { Id = Guid.NewGuid(), Name = "A2", IsActive = false, IsDefault = true, UserId = Guid.NewGuid() },
					new() { Id = Guid.NewGuid(), Name = "A3", IsActive = true, UserId = adminId },
					new() { Id = Guid.NewGuid(), Name = "A4", IsActive = true, UserId = Guid.NewGuid() }
				};
		var dbSetMock = assistants.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		currentUserServiceMock.Setup(x => x.UserId).Returns(adminId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);

		var handler = new GetAssistantsQueryHandler(dbContextMock.Object, currentUserServiceMock.Object);
		var result = await handler.Handle(new GetAssistantsQuery(null), CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(3, result.Data.Count);
	}

	[Fact]
	public async Task Should_ReturnActiveUserAndDefaultAssistants_When_IsActiveIsFalse()
	{
		var userId = Guid.NewGuid();
		var assistants = new List<Assistant>
				{
					new() { Id = Guid.NewGuid(), Name = "A1", IsActive = true, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A2", IsActive = false, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A3", IsActive = false, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A4", IsActive = true, IsDefault = true, UserId = Guid.NewGuid() },
					new() { Id = Guid.NewGuid(), Name = "A5", IsActive = false, IsDefault = true, UserId = Guid.NewGuid() }
				};
		var dbSetMock = assistants.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.User);

		var handler = new GetAssistantsQueryHandler(dbContextMock.Object, currentUserServiceMock.Object);
		var result = await handler.Handle(new GetAssistantsQuery(false), CancellationToken.None);

		Assert.True(result.IsSuccess);

		Assert.Equal(2, result.Data.Count);
		Assert.Contains(result.Data, x => x.Name == "A1");
		Assert.Contains(result.Data, x => x.Name == "A4");
	}

	[Fact]
	public async Task Should_ReturnAllUserAssistants_When_IsActiveIsNull()
	{
		var userId = Guid.NewGuid();
		var assistants = new List<Assistant>
				{
					new() { Id = Guid.NewGuid(), Name = "A1", IsActive = true, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A2", IsActive = true, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A3", IsActive = false, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A4", IsActive = true, IsDefault = true, UserId = Guid.NewGuid() }
				};
		var dbSetMock = assistants.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.User);

		var handler = new GetAssistantsQueryHandler(dbContextMock.Object, currentUserServiceMock.Object);
		var result = await handler.Handle(new GetAssistantsQuery(null), CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(3, result.Data.Count);
		Assert.Contains(result.Data, x => x.Name == "A1");
		Assert.Contains(result.Data, x => x.Name == "A2");
		Assert.Contains(result.Data, x => x.Name == "A3");
	}

	[Fact]
	public async Task Should_ReturnActiveAndDefaultAssistants_When_RoleIsUser()
	{
		var userId = Guid.NewGuid();
		var assistants = new List<Assistant>
				{
					new() { Id = Guid.NewGuid(), Name = "A1", IsActive = true, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A2", IsActive = true, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A3", IsActive = false, UserId = userId },
					new() { Id = Guid.NewGuid(), Name = "A4", IsActive = true, IsDefault = true, UserId = Guid.NewGuid() }
				};
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dbSetMock = assistants.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);

		currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.User);

		var handler = new GetAssistantsQueryHandler(dbContextMock.Object, currentUserServiceMock.Object);
		var result = await handler.Handle(new GetAssistantsQuery(true), CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(3, result.Data.Count);
		Assert.Contains(result.Data, x => x.Name == "A1");
		Assert.Contains(result.Data, x => x.Name == "A2");
		Assert.Contains(result.Data, x => x.Name == "A4");
	}
}
