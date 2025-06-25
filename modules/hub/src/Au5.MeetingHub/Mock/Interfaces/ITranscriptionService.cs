using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub.Mock.Interfaces;

public interface ITranscriptionService
{
    void UpsertBlock(EntryMessage entry);
     void InsertBlock(EntryMessage entry);
    string GetFullTranscriptionAsJson(string meetingId);
    void FinalizeMeeting(string meetingId);
    void AppliedReaction(ReactionAppliedMessage reaction);
}
