namespace Au5.Application.Features.Meetings.ApplyReaction;

public record ApplyReactionCommand(ReactionAppliedMessage Reaction) : IRequest;
