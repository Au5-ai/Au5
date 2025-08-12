using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result<Guid>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IHttpClientFactory _httpClientFactory;
	private readonly IMeetingUrlService _meetingUrlService;

	public AddBotCommandHandler(IApplicationDbContext dbContext, IHttpClientFactory httpClientFactory, IMeetingUrlService meetingUrlService)
	{
		_dbContext = dbContext;
		_httpClientFactory = httpClientFactory;
		_meetingUrlService = meetingUrlService;
	}

	public async ValueTask<Result<Guid>> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = Guid.NewGuid();
		var raw = $"{meetingId}{DateTime.Now:O}";
		var bytes = Encoding.UTF8.GetBytes(raw);
		var hash = SHA256.HashData(bytes);
		var hashToken = Convert.ToBase64String(hash);

		var organization = await _dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);
		if (organization is null)
		{
			return Error.Failure(description: "Organization not configured");
		}

		_dbContext.Set<Meeting>().Add(new Meeting()
		{
			Id = meetingId,
			MeetId = request.MeetId,
			BotName = request.BotName,
			IsBotAdded = false,
			BotInviterUserId = request.UserId,
			CreatedAt = DateTime.UtcNow,
			Platform = request.Platform,
			Status = MeetingStatus.NotStarted,
			HashToken = hashToken
		});

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		if (dbResult.IsSuccess)
		{
			var payload = new
			{
				hubUrl = organization.HubUrl,
				platform = request.Platform,
				meetingUrl = _meetingUrlService.GetMeetingUrl(request.Platform, request.MeetId),
				botDisplayName = organization.BotName,
				meetId = request.MeetId,
				hashToken,
				language = organization.Language,
				autoLeave = new
				{
					waitingEnter = 30000,
					noParticipant = 60000,
					allParticipantsLeft = 120000
				},
				meeting_settings = new
				{
					video_recording = true,
					audio_recording = true,
					transcription = true,
					transcription_model = "liveCaption"
				}
			};

			var json = JsonSerializer.Serialize(payload);
			var content = new StringContent(json, Encoding.UTF8, "application/json");

			var botFatherUrl = "http://host.containers.internal:1367/create-container";

			var httpClient = _httpClientFactory.CreateClient();
			try
			{
				var response = await httpClient.PostAsync(botFatherUrl, content, cancellationToken);

				if (!response.IsSuccessStatusCode)
				{
					var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
					return Error.Failure(description: $"Failed to create bot: {errorContent}");
				}
			}
			catch (Exception ex)
			{
				return Error.Failure(description: $"Error communicating with BotFather: {ex.Message}");
			}
		}

		return dbResult.IsSuccess ? meetingId : Error.Failure(description: AppResources.FailedToAddBot);
	}
}
