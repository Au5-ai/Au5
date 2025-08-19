using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result>
{
	private const string BotFatherUrl = "http://host.containers.internal:1367/create-container";

	private readonly IApplicationDbContext _dbContext;
	private readonly IHttpClientFactory _httpClientFactory;
	private readonly IMeetingUrlService _meetingUrlService;
	private readonly ILogger<AddBotCommandHandler> _logger;

	public AddBotCommandHandler(
		IApplicationDbContext dbContext,
		IHttpClientFactory httpClientFactory,
		IMeetingUrlService meetingUrlService,
		ILogger<AddBotCommandHandler> logger)
	{
		_dbContext = dbContext;
		_httpClientFactory = httpClientFactory;
		_meetingUrlService = meetingUrlService;
		_logger = logger;
	}

	public async ValueTask<Result> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = Guid.NewGuid();
		var hashToken = GenerateHashToken(meetingId);

		var organization = await GetOrganizationAsync(cancellationToken);
		if (organization is null)
		{
			return Error.Failure(description: "Organization not configured");
		}

		AddMeetingToContext(request, meetingId, hashToken);

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		if (!dbResult.IsSuccess)
		{
			return Error.Failure(description: AppResources.FailedToAddBot);
		}

		var payload = BuildBotPayload(request, organization, hashToken);
		var httpResult = await SendBotCreationRequestAsync(payload, cancellationToken);

		return httpResult.IsSuccess ? Result.Success() : httpResult;
	}

	private static string GenerateHashToken(Guid meetingId)
	{
		var raw = $"{meetingId}{DateTime.UtcNow:O}";
		var bytes = Encoding.UTF8.GetBytes(raw);
		var hash = SHA256.HashData(bytes);
		return Convert.ToBase64String(hash);
	}

	private Task<Organization> GetOrganizationAsync(CancellationToken cancellationToken) =>
		_dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);

	private void AddMeetingToContext(AddBotCommand request, Guid meetingId, string hashToken)
	{
		_dbContext.Set<Meeting>().Add(new Meeting
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
	}

	private object BuildBotPayload(AddBotCommand request, Organization organization, string hashToken) =>
		new
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

	private async Task<Result> SendBotCreationRequestAsync(object payload, CancellationToken cancellationToken)
	{
		var json = JsonSerializer.Serialize(payload);
		var content = new StringContent(json, Encoding.UTF8, "application/json");

		var httpClient = _httpClientFactory.CreateClient();

		try
		{
			var response = await httpClient.PostAsync(BotFatherUrl, content, cancellationToken);
			if (!response.IsSuccessStatusCode)
			{
				var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
				_logger.LogError("Failed to create bot: {Error}", errorContent);
				return Error.Failure(description: $"Failed to create bot: {errorContent}");
			}

			return Result.Success();
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with BotFather.");
			return Error.Failure(description: $"Error communicating with BotFather: {ex.Message}");
		}
	}
}
