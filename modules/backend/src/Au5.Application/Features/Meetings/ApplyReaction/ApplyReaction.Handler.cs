namespace Au5.Application.Features.Meetings.ApplyReaction;

public class ApplyReactionHandler : IRequestHandler<ApplyReactionCommand>
{
	private readonly IMeetingRepository _repo;

	public ApplyReactionHandler(IMeetingRepository repo) => _repo = repo;

	public async ValueTask<Unit> Handle(ApplyReactionCommand request, CancellationToken cancellationToken)
	{
		var reactionMsg = request.Reaction;

		var reaction = new AppliedReactions
		{
			ReactionId = reactionMsg.ReactionId,
			Participants = [new() { Id = reactionMsg.User.Id }]
		};

		await _repo.ApplyReactionAsync(reactionMsg.MeetId, reactionMsg.BlockId, reaction, cancellationToken);
		return Unit.Value;
	}
}
