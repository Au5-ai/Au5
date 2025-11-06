using System.Text;

namespace Au5.Application.Features.Meetings.ExportToText;

public class ExportToTextQueryHandler : IRequestHandler<ExportToTextQuery, Result<string>>
{
	private readonly IApplicationDbContext _dbContext;

	public ExportToTextQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<string>> Handle(ExportToTextQuery request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.Include(x => x.Participants)
				.ThenInclude(p => p.User)
			.Include(x => x.Guests)
			.Include(x => x.Entries)
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId && m.MeetId == request.MeetId, cancellationToken);

		if (meeting is null)
		{
			return Error.NotFound(description: "No meeting with this ID was found.");
		}

		var textContent = GenerateTextExport(meeting);
		return textContent;
	}

	private static string GenerateTextExport(Meeting meeting)
	{
		var sb = new StringBuilder();

		sb.AppendLine($"Meeting Transcription: {meeting.MeetName}");
		sb.AppendLine($"Meeting started: {meeting.CreatedAt:M/d/yyyy, h:mm:ss tt}");

		var durationMinutes = ParseDuration(meeting.Duration);
		sb.AppendLine($"Duration: {durationMinutes} minutes");

		var participantNames = GetParticipantNames(meeting);
		sb.AppendLine($"Participants: {participantNames}");
		sb.AppendLine();
		sb.AppendLine("Transcript");
		sb.AppendLine(new string('-', 50));

		var orderedEntries = meeting.Entries
			.OrderBy(e => e.Timestamp)
			.ToList();

		var baseTime = meeting.CreatedAt;

		foreach (var entry in orderedEntries)
		{
			var timeline = (entry.Timestamp - baseTime).ToString(@"mm\:ss");
			sb.AppendLine($"{timeline} {entry.FullName}: {entry.Content}");
		}

		return sb.ToString();
	}

	private static string GetParticipantNames(Meeting meeting)
	{
		var names = new List<string>();

		if (meeting.Participants != null)
		{
			names.AddRange(meeting.Participants.Select(p => p.User.FullName));
		}

		if (meeting.Guests != null)
		{
			names.AddRange(meeting.Guests.Select(g => g.FullName));
		}

		return names.Count != 0 ? string.Join(", ", names) : "No participants";
	}

	private static int ParseDuration(string duration)
	{
		return string.IsNullOrEmpty(duration)
			? 0
			: TimeSpan.TryParse(duration, out var timeSpan)
				? (int)timeSpan.TotalMinutes
				: 0;
	}
}
