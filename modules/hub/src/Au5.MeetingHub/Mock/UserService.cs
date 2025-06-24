using Au5.MeetingHub.Mock.Interfaces;

namespace Au5.MeetingHub.Mock;

public class UserService : IUserService
{
    private readonly Lock _lock = new();
    private static readonly ConcurrentDictionary<string, List<User>> _activeUsersInMeeting = new();

    public void AddUserToMeeting(User user, string meetingId)
    {
        var users = _activeUsersInMeeting.GetOrAdd(meetingId, _ => []);

        lock (_lock)
        {
            bool userExists = users.Any(x => x.Id == user.Id);
            if (!userExists)
            {
                users.Add(user);
            }
        }
    }
}
