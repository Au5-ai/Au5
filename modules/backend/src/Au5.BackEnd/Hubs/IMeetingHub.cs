namespace Au5.BackEnd.Hubs;
public interface IMeetingHub
{
	Task UserJoinedInMeeting(UserJoinedInMeetingMessage msg, CancellationToken cancellationToken);

	Task RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage, CancellationToken cancellationToken);

	Task BotJoinedInMeeting(string meetingId, CancellationToken cancellationToken);

	Task Entry(EntryMessage transcription, CancellationToken cancellationToken);

	Task ReactionApplied(ReactionAppliedMessage reaction, CancellationToken cancellationToken);

	Task PauseAndPlayTranscription(PauseAndPlayTranscriptionMessage message, CancellationToken cancellationToken);
}
