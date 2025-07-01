namespace Au5.Domain.Entities;

public class Meeting
{
    public Guid Id { get; set; }
    public string MeetingId { get; set; }
    public Guid CreatorUserId { get; set; }
    public string BotName { get; set; }
    public bool IsBotAdded { get; set; }
    public List<Entry> Entries { get; set; }
    public List<Guid> Users { get; set; }
    public List<string> Participants { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Platform { get; set; }
    public MeetingStatus Status { get; set; }

    public bool IsActive()
        => Status == MeetingStatus.Recording || Status == MeetingStatus.Paused;

    public bool IsPaused()
        => Status == MeetingStatus.Paused;

    public bool IsRecording()
        => Status == MeetingStatus.Recording;

    public bool IsEnded()
        => Status == MeetingStatus.Ended;
}
