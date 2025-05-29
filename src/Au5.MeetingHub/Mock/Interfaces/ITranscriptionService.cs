namespace Au5.MeetingHub.Mock.Interfaces;

public interface ITranscriptionService
{
    void UpsertBlock(TranscriptionEntry entry);
    string GetFullTranscriptionAsJson(string meetingId);
    void FinalizeMeeting(string meetingId);
}
