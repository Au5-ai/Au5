using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub.Models.Entity;

public class Meeting
{
    public Guid Id { get; set; }
    public string MeetingId { get; set; }
    public List<EntryMessage> Entries { get; set; }
    public User UserAddedBot { get; set; }
    public string BotName { get; set; }
    public bool IsBotAdded { get; set; }
    public List<Guid> Users { get; set; }
    public List<string> Participants { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string Platform { get; set; }
    public MeetingStatus Status { get; set; }
}
