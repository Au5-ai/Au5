namespace Au5.Application.Features.Implement;

public class ReactionService
{
	public IReadOnlyCollection<Reaction> GetAll()
	{
		List<Reaction> reactions = [
			new Reaction() { Id = 1,  Type = "Task", Emoji = "⚡", ClassName = "reaction-task" },
			new Reaction() { Id = 2, Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important" },
			new Reaction() { Id = 3, Type = "Goal", Emoji = "🎯", ClassName = "reaction-question" }
	  ];

		return reactions;
	}
}
