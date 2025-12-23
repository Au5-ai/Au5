namespace Au5.Application.Features.AI.GetAll;

public record GetAIContentsQuery(Guid MeetingId) : IRequest<Result<IReadOnlyCollection<AIContentsResponse>>>;

public record AIContentsResponse
{
	public Guid Id { get; set; }

	public Participant User { get; set; }

	public AIContentAssistant Assistant { get; set; }

	public string Content { get; set; }

	public string CreatedAt { get; set; }
}

public record AIContentAssistant
{
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string Icon { get; set; }

	public string Description { get; set; }

	public string Instructions { get; set; }
}
