using Au5.MeetingHub.Mock.Interfaces;
using Au5.MeetingHub.Models.Entity;
using Au5.MeetingHub.Models.Messages;
using System.Text.Json;

namespace Au5.MeetingHub.Mock;

public class TranscriptionService : ITranscriptionService
{
    private static readonly ConcurrentDictionary<string, Dictionary<string, TranscriptionEntry>> _meetingTranscriptions = new();
    private static readonly Lock _lock = new();

    private static readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public void UpsertBlock(TranscriptionEntryMessage entry)
    {
        var meetingBlocks = _meetingTranscriptions.GetOrAdd(entry.MeetingId, _ => []);
        lock (_lock)
        {
            if (!meetingBlocks.TryGetValue(entry.TranscriptBlockId, out var block) || block is null)
            {
                meetingBlocks[entry.TranscriptBlockId] = new TranscriptionEntry()
                {
                    MeetingId = entry.MeetingId,
                    TranscriptBlockId = entry.TranscriptBlockId,
                    Transcript = entry.Transcript,
                    Speaker = entry.Speaker,
                    Timestamp = entry.Timestamp,
                    Reactions = []
                };
            }
            else
            {
                block.Transcript = entry.Transcript;
            }
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
                    transcript = b.Transcript
                })
        };

        return JsonSerializer.Serialize(result, _jsonSerializerOptions);
    }

    public void FinalizeMeeting(string meetingId)
    {

    }

    public void AppliedReaction(ReactionAppliedMessage reaction)
    {
        _meetingTranscriptions.TryGetValue(reaction.MeetingId, out var meetingBlocks);
        if (meetingBlocks is null || !meetingBlocks.TryGetValue(reaction.TranscriptBlockId, out var entry))
        {
            return;
        }

        lock (_lock)
        {
            entry.Reactions ??= [];

            var existingReaction = entry.Reactions.FirstOrDefault(r => r.ReactionType == reaction.ReactionType);
            existingReaction.Users ??= [];

            if (!existingReaction.Users.Any(u => u == reaction.UserFullName))
            {
                existingReaction.Users.Add(reaction.UserFullName);
            }
            else
            {
                existingReaction.Users.RemoveAll(u => u == reaction.UserFullName);
            }
        }
    }
}
