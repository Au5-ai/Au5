namespace Au5.MeetingHub.Models.Messages;

public record struct Reactions
{
    public List<string> Users { get; set; }
    public string ReactionType { get; set; }
}
