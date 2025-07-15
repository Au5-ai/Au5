namespace Au5.Domain.Common;

/// <summary>
/// Represents the current status of a meeting.
/// </summary>
public enum MeetingStatus
{
    /// <summary>
    /// The meeting has not started yet.
    /// </summary>
    NotStarted,

    /// <summary>
    /// The meeting is currently in progress and being recorded.
    /// </summary>
    Recording,

    /// <summary>
    /// The meeting recording is temporarily paused.
    /// </summary>
    Paused,

    /// <summary>
    /// The meeting has ended.
    /// </summary>
    Ended,
}
