namespace Au5.MeetingHub.Mock;

public interface IUserService
{
    IReadOnlyList<User> AddUserToMeeting(User user, string meetingId);
}

public class UserService : IUserService
{
    private static readonly ConcurrentDictionary<string, List<User>> _activeUsersInMeeting = new();

    public IReadOnlyList<User> AddUserToMeeting(User user, string meetingId)
    {
        var users = _activeUsersInMeeting.GetOrAdd(meetingId, _ => []);

        lock (users)
        {
            bool userExists = users.Any(x => x.Id == user.Id);
            if (!userExists)
            {
                users.Add(user);
            }

            return users;
        }
    }
}
