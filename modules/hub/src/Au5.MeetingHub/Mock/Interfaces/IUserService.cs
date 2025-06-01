namespace Au5.MeetingHub.Mock.Interfaces;

public interface IUserService
{
    IReadOnlyList<User> AddUserToMeeting(User user, string meetingId);
}
