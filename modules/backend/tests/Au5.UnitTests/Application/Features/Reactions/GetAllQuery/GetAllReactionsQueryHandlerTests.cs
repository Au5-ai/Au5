using Au5.Application.Features.Reactions.GetAllQuery;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Reactions.GetAllQuery;

public class GetAllReactionsQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly GetAllReactionsQueryHandler _handler;
	private readonly Guid _organizationId;

	public GetAllReactionsQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_organizationId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(_organizationId);

		_handler = new GetAllReactionsQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_NoReactionsExist()
	{
		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(new List<Reaction>().BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_ReturnOnlyOrganizationReactions_When_MultipleOrganizationsExist()
	{
		var otherOrgId = Guid.NewGuid();

		var reaction1 = new Reaction
		{
			Id = 1,
			OrganizationId = _organizationId,
			Type = "Agree",
			Emoji = "👍"
		};

		var reaction2 = new Reaction
		{
			Id = 2,
			OrganizationId = otherOrgId,
			Type = "Disagree",
			Emoji = "👎"
		};

		var reaction3 = new Reaction
		{
			Id = 3,
			OrganizationId = _organizationId,
			Type = "Question",
			Emoji = "❓"
		};

		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(new List<Reaction> { reaction1, reaction2, reaction3 }.BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(2, result.Count);
		Assert.Contains(result, r => r.Type == "Agree");
		Assert.Contains(result, r => r.Type == "Question");
		Assert.DoesNotContain(result, r => r.Type == "Disagree");
	}

	[Fact]
	public async Task Should_ReturnAllReactions_When_AllBelongToOrganization()
	{
		var reactions = new List<Reaction>
		{
			new() { Id = 1, OrganizationId = _organizationId, Type = "Agree", Emoji = "👍" },
			new() { Id = 2, OrganizationId = _organizationId, Type = "Disagree", Emoji = "👎" },
			new() { Id = 3, OrganizationId = _organizationId, Type = "Question", Emoji = "❓" },
			new() { Id = 4, OrganizationId = _organizationId, Type = "Important", Emoji = "⭐" }
		};

		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(reactions.BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(4, result.Count);
	}

	[Fact]
	public async Task Should_ReturnReactionWithAllProperties_When_ReactionsExist()
	{
		var reaction = new Reaction
		{
			Id = 1,
			OrganizationId = _organizationId,
			Type = "Agree",
			Emoji = "👍"
		};

		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(new List<Reaction> { reaction }.BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		var returnedReaction = result.First();
		Assert.Equal(1, returnedReaction.Id);
		Assert.Equal(_organizationId, returnedReaction.OrganizationId);
		Assert.Equal("Agree", returnedReaction.Type);
		Assert.Equal("👍", returnedReaction.Emoji);
	}

	[Fact]
	public async Task Should_UseCurrentUserOrganizationId_When_FilteringReactions()
	{
		var specificOrgId = Guid.NewGuid();
		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(specificOrgId);

		var handler = new GetAllReactionsQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);

		var reaction1 = new Reaction
		{
			Id = 1,
			OrganizationId = specificOrgId,
			Type = "Like",
			Emoji = "❤️"
		};

		var reaction2 = new Reaction
		{
			Id = 2,
			OrganizationId = Guid.NewGuid(),
			Type = "Dislike",
			Emoji = "💔"
		};

		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(new List<Reaction> { reaction1, reaction2 }.BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Single(result);
		Assert.Equal("Like", result.First().Type);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(new List<Reaction>().BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<Reaction>(), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnMultipleReactionTypes_When_OrganizationHasVariousReactions()
	{
		var reactions = new List<Reaction>
		{
			new() { Id = 1, OrganizationId = _organizationId, Type = "Agree", Emoji = "👍" },
			new() { Id = 2, OrganizationId = _organizationId, Type = "Disagree", Emoji = "👎" },
			new() { Id = 3, OrganizationId = _organizationId, Type = "Question", Emoji = "❓" },
			new() { Id = 4, OrganizationId = _organizationId, Type = "Important", Emoji = "⭐" },
			new() { Id = 5, OrganizationId = _organizationId, Type = "Idea", Emoji = "💡" }
		};

		_dbContextMock.Setup(db => db.Set<Reaction>())
			.Returns(reactions.BuildMockDbSet().Object);

		var query = new GetAllReactionsQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.Equal(5, result.Count);
		Assert.Contains(result, r => r.Emoji == "👍");
		Assert.Contains(result, r => r.Emoji == "👎");
		Assert.Contains(result, r => r.Emoji == "❓");
		Assert.Contains(result, r => r.Emoji == "⭐");
		Assert.Contains(result, r => r.Emoji == "💡");
	}
}
