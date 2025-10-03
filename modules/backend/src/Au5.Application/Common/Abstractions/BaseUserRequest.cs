//namespace Au5.Application.Common.Abstractions;

///// <summary>
///// Base class for queries that require user context.
///// </summary>
///// <typeparam name="TResponse">The response type</typeparam>
//public abstract record BaseUserQuery<TResponse> : IRequest<TResponse>, IUserContextRequest
//{
//    public Guid UserId { get; set; }
//}

///// <summary>
///// Base class for commands that require user context.
///// </summary>
///// <typeparam name="TResponse">The response type</typeparam>
//public abstract record BaseUserCommand<TResponse> : IRequest<TResponse>, IUserContextRequest
//{
//    public Guid UserId { get; set; }
//}
