using Au5.MeetingHub.Mock.Interfaces;
using System.Text.Json;

namespace Au5.MeetingHub.Mock;

public class TranscriptionService : ITranscriptionService
{
    private static readonly ConcurrentDictionary<string, Dictionary<string, TranscriptionEntry>> _meetingTranscriptions = new();
    private static readonly Lock _lock = new();

    // Cache the JsonSerializerOptions instance to avoid creating a new one for every serialization operation  
    private static readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public void UpsertBlock(TranscriptionEntry entry)
    {
        var meetingBlocks = _meetingTranscriptions.GetOrAdd(entry.MeetingId, _ => new Dictionary<string, TranscriptionEntry>());

        lock (_lock)
        {
            meetingBlocks[entry.TranscriptBlockId] = entry;
        }
    }

    public string GetFullTranscriptionAsJson(string meetingId)
    {
        if (!_meetingTranscriptions.TryGetValue(meetingId, out var blocks))
            return "{}";

        var result = new
        {
            meeting_id = meetingId,
            transcripts = blocks.Values
                .OrderBy(b => b.Timestamp)
                .Select(b => new
                {
                    time = b.Timestamp,
                    speaker = b.Speaker?.FullName ?? "Unknown",
                    text = b.Transcript
                })
        };

        return JsonSerializer.Serialize(result, _jsonSerializerOptions);
    }

    public void FinalizeMeeting(string meetingId)
    {
        if (_meetingTranscriptions.TryRemove(meetingId, out var blocks))
        {
            string finalTranscript = GetFullTranscriptionAsJson(meetingId);
            File.WriteAllText($"transcription_{meetingId}.json", finalTranscript);
            // TODO: Save finalTranscript to DB here  
        }
    }
}
