using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Piplines;
using Mediator;

namespace Au5.UnitTests.Application.Common.Pipelines;

public delegate ValueTask<TResponse> MessageHandlerDelegate<TRequest, TResponse>(TRequest request, CancellationToken cancellationToken);

public class UserContextBehaviorTests
{
	[Fact]
	public async Task Handle_WhenRequestImplementsIUserContextRequest_AndUserIsAuthenticated_SetsUserIdAndCallsNext()
	{
		var userId = Guid.NewGuid();
		var mockCurrentUserService = new Mock<ICurrentUserService>();
		mockCurrentUserService.Setup(s => s.IsAuthenticated).Returns(true);
		mockCurrentUserService.Setup(s => s.UserId).Returns(userId);

		var behavior = new UserContextBehavior<TestUserContextRequest, string>(mockCurrentUserService.Object);

		var request = new TestUserContextRequest();

		var wasNextCalled = false;
		ValueTask<string> Next(TestUserContextRequest req, CancellationToken ct)
		{
			wasNextCalled = true;
			Assert.Equal(userId, req.UserId);
			return new ValueTask<string>("success");
		}

		var result = await behavior.Handle(request, Next, CancellationToken.None);

		Assert.True(wasNextCalled);
		Assert.Equal(userId, request.UserId);
		Assert.Equal("success", result);
	}

	[Fact]
	public async Task Handle_WhenRequestImplementsIUserContextQuery_AndUserIsAuthenticated_SetsUserIdAndCallsNext()
	{
		var userId = Guid.NewGuid();
		var mockCurrentUserService = new Mock<ICurrentUserService>();
		mockCurrentUserService.Setup(s => s.IsAuthenticated).Returns(true);
		mockCurrentUserService.Setup(s => s.UserId).Returns(userId);

		var behavior = new UserContextBehavior<TestUserContextQuery, string>(mockCurrentUserService.Object);

		var request = new TestUserContextQuery();

		var wasNextCalled = false;
		ValueTask<string> Next(TestUserContextQuery query, CancellationToken ct)
		{
			wasNextCalled = true;
			Assert.Equal(userId, query.UserId);
			return new ValueTask<string>("success");
		}

		var result = await behavior.Handle(request, Next, CancellationToken.None);

		Assert.True(wasNextCalled);
		Assert.Equal(userId, request.UserId);
		Assert.Equal("success", result);
	}

	[Fact]
	public async Task Handle_WhenRequestImplementsIUserContextRequest_AndUserIsNotAuthenticated_ThrowsUnauthorizedAccessException()
	{
		var mockCurrentUserService = new Mock<ICurrentUserService>();
		mockCurrentUserService.Setup(s => s.IsAuthenticated).Returns(false);

		var behavior = new UserContextBehavior<TestUserContextRequest, string>(mockCurrentUserService.Object);

		var request = new TestUserContextRequest();

		static ValueTask<string> Next(TestUserContextRequest req, CancellationToken ct)
		{
			throw new Exception("Next delegate should not be called if not authenticated");
		}

		await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
			behavior.Handle(request, Next, CancellationToken.None).AsTask());
	}

	[Fact]
	public async Task Handle_WhenRequestDoesNotImplementIUserContextRequest_CallsNextWithoutSettingUserId()
	{
		var mockCurrentUserService = new Mock<ICurrentUserService>();

		var behavior = new UserContextBehavior<TestNonUserContextRequest, string>(mockCurrentUserService.Object);

		var request = new TestNonUserContextRequest();

		var wasNextCalled = false;
		ValueTask<string> Next(TestNonUserContextRequest req, CancellationToken ct)
		{
			wasNextCalled = true;
			return new ValueTask<string>("next-called");
		}

		var result = await behavior.Handle(request, Next, CancellationToken.None);

		Assert.True(wasNextCalled);
		Assert.Equal("next-called", result);
	}
}

public record TestUserContextQuery : BaseUserQuery<string>
{
}

public record TestUserContextRequest : BaseUserCommand<string>
{
}

public class TestNonUserContextRequest : IRequest<string>
{
}
