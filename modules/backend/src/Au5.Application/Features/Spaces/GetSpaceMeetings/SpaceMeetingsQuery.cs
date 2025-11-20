using Au5.Application.Features.Meetings.MyMeeting;

namespace Au5.Application.Features.Spaces.GetSpaceMeetings;

public record SpaceMeetingsQuery(Guid SpaceId) : IRequest<Result<IReadOnlyCollection<MyMeetingsGroupedResponse>>>;
