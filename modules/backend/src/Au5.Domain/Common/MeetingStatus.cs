namespace Au5.Domain.Common;

/// <summary>
/// Represents the current status of a meeting.
/// </summary>
public enum MeetingStatus : byte
{
	/// <summary>
	/// The meeting has not started yet.
	/// </summary>
	WaitingToAddBot = 0,

	/// <summary>
	/// The meeting is currently in progress and being recorded.
	/// </summary>
	Recording = 10,

	/// <summary>
	/// The meeting recording is temporarily paused.
	/// </summary>
	Paused = 20,

	/// <summary>
	/// The meeting has ended.
	/// </summary>
	Ended = 30,

	/// <summary>
	/// The meeting has been archived.
	/// </summary>
	Archived = 100,

	/// <summary>
	/// The Meeting has been deleted.
	/// </summary>
	Deleted = 255
}
