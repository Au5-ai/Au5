namespace Au5.Application.Features.Meetings.AddUserToMeeting;

public class AddUserToMeetingHandler : IRequestHandler<AddUserToMeetingCommand, Meeting>
{
	private readonly IMeetingRepository _repo;

	public AddUserToMeetingHandler(IMeetingRepository repo) => _repo = repo;

	public async ValueTask<Meeting> Handle(AddUserToMeetingCommand request, CancellationToken cancellationToken)
	{
		var msg = request.UserJoined;
		Meeting meeting;

		try
		{
			meeting = await _repo.GetMeetingAsync(msg.MeetId, cancellationToken);
			if (meeting.IsEnded())
			{
				meeting = NewMeeting(msg);
			}
		}
		catch (KeyNotFoundException)
		{
			meeting = NewMeeting(msg);
		}

		if (!meeting.Participants.Any(u => u.UserId == msg.User.Id))
		{
			meeting.Participants.Add(new ParticipantInMeeting
			{
				UserId = msg.User.Id,
				FullName = msg.User.FullName,
				PictureUrl = msg.User.PictureUrl
			});
		}

		await _repo.SaveMeetingAsync(meeting, cancellationToken);
		return meeting;

		static Meeting NewMeeting(UserJoinedInMeetingMessage m)
		{
			return new()
			{
				Id = Guid.NewGuid(),
				MeetId = m.MeetId,
				CreatedAt = DateTime.UtcNow,
				Platform = m.Platform,
				Status = MeetingStatus.NotStarted
			};
		}
	}
}
