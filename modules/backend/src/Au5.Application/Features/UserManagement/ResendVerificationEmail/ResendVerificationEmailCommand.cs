namespace Au5.Application.Features.UserManagement.ResendVerificationEmail;

public record ResendVerificationEmailCommand : IRequest<Result<ResendVerificationEmailResponse>>
{
    public Guid UserId { get; init; }
}

public record ResendVerificationEmailResponse(string Link);
