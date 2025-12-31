namespace Au5.Application.Features.Meetings.AddParticipants;

public record AddParticipantCommand(Guid MeetingId, IReadOnlyCollection<Guid> ParticipantsId) : IRequest<Result<IReadOnlyCollection<Participant>>>;
