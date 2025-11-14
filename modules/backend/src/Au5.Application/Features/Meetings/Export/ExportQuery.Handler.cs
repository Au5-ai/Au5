using System.Text;
using System.Text.RegularExpressions;

namespace Au5.Application.Features.Meetings.Export;

public class ExportToTextQueryHandler : IRequestHandler<ExportQuery, Result<string>>
{
	private readonly IApplicationDbContext _dbContext;

	public ExportToTextQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<string>> Handle(ExportQuery request, CancellationToken cancellationToken)
	{
		var meeting = await _dbContext.Set<Meeting>()
			.Include(x => x.Participants)
				.ThenInclude(p => p.User)
			.Include(x => x.Guests)
			.Include(x => x.Entries)
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId, cancellationToken);

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

		var durationMinutes = ParseReadableDurationToMinutes(meeting.Duration);
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

	private static int ParseReadableDurationToMinutes(string input)
	{
		if (string.IsNullOrWhiteSpace(input))
		{
			return 0;
		}

		var regex = new Regex(@"(\d+)([dhms])", RegexOptions.IgnoreCase);

		int days = 0, hours = 0, minutes = 0, seconds = 0;

		foreach (Match match in regex.Matches(input))
		{
			var value = int.Parse(match.Groups[1].Value);
			var unit = match.Groups[2].Value.ToLower();

			switch (unit)
			{
				case "d":
					days = value;
					break;
				case "h":
					hours = value;
					break;
				case "m":
					minutes = value;
					break;
				case "s":
					seconds = value;
					break;
			}
		}

		var total = new TimeSpan(days, hours, minutes, seconds);
		return (int)total.TotalMinutes;
	}
}
