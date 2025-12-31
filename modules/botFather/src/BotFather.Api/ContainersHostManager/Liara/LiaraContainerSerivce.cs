using BotFather.Api.ContainersHostManager.Liara.Models;

namespace BotFather.Api.ContainersHostManager.Liara;

public class LiaraContainerSerivce : IContainerService
{
    private readonly HttpClient _httpClient;
    private readonly LiaraOptions _options;
    private readonly ILogger<LiaraContainerSerivce> _logger;

    public LiaraContainerSerivce(HttpClient httpClient, IOptions<LiaraOptions> options, ILogger<LiaraContainerSerivce> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value ?? throw new InvalidOperationException("Liara options are not configured");
        _options.Validate();

        _httpClient.BaseAddress = new Uri(LiaraApiUrls.BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.AuthToken}");
        _httpClient.DefaultRequestHeaders.Add("accept", "application/json");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "BotFather/1.8.4");
    }

    public async Task<(bool Success, string Error)> CreateAndStartContainerAsync(BotPayload payload)
    {
        var projectName = ContainerUtility.GenerateContainerName(payload.MeetId, payload.HashToken);

        var createSuccess = await CreateProjectAsync(projectName);
        if (!createSuccess)
        {
            return (false, "Failed to create project");
        }

        var updateSuccess = await UpdateEnvironmentVariablesAsync(projectName, payload);
        if (!updateSuccess)
        {
            return (false, "Failed to update environment variables");
        }

        var deploySuccess = await DeployProjectAsync(projectName);
        if (!deploySuccess)
        {
            return (false, "Failed to deploy project");
        }

        return (true, null);
    }

    public async Task<(bool Success, string Error)> RemoveContainerAsync(string meetId, string hashToken)
    {
        var projectName = ContainerUtility.GenerateContainerName(meetId, hashToken);

        var deleteSuccess = await DeleteProjectAsync(projectName);
        if (!deleteSuccess)
        {
            return (false, "Failed to delete project");
        }

        return (true, null);
    }

    private async Task<bool> CreateProjectAsync(string projectName)
    {
        try
        {
            var request = new CreateProjectRequest
            {
                Name = projectName,
                Platform = "docker",
                ReadOnlyRootFilesystem = false,
                Network = _options.NetworkId,
                PlanID = _options.PlanId,
                BundlePlanID = _options.BundlePlanId
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(LiaraApiUrls.CreateProject, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create project: {StatusCode} - {Response}", response.StatusCode, responseBody);
                return false;
            }

            _logger.LogInformation("Project {ProjectName} created successfully", projectName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project {ProjectName}", projectName);
            return false;
        }
    }

    private async Task<bool> UpdateEnvironmentVariablesAsync(string projectName, BotPayload payload)
    {
        try
        {
            var meetingConfig = new BotPayload
            {
                HubUrl = payload.HubUrl,
                Platform = payload.Platform,
                MeetingUrl = payload.MeetingUrl,
                BotDisplayName = payload.BotDisplayName,
                MeetId = payload.MeetId,
                HashToken = payload.HashToken,
                Language = payload.Language,
                JwtToken = payload.JwtToken,
                AutoLeaveSettings = new AutoLeaveSettings
                {
                    WaitingEnter = payload.AutoLeaveSettings.WaitingEnter,
                    NoParticipant = payload.AutoLeaveSettings.NoParticipant,
                    AllParticipantsLeft = payload.AutoLeaveSettings.AllParticipantsLeft
                },
                MeetingSettings = new MeetingSettings
                {
                    VideoRecording = payload.MeetingSettings.VideoRecording,
                    AudioRecording = payload.MeetingSettings.AudioRecording,
                    Transcription = payload.MeetingSettings.Transcription,
                    TranscriptionModel = payload.MeetingSettings.TranscriptionModel
                }
            };

            var meetingConfigJson = JsonSerializer.Serialize(meetingConfig, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            var request = new UpdateEnvsRequest
            {
                Project = projectName,
                Variables =
                [
                    new() {
                        Key = "MEETING_CONFIG",
                        Value = meetingConfigJson
                    }
                ]
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(LiaraApiUrls.UpdateEnvs, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to update environment variables: {StatusCode} - {Response}", response.StatusCode, responseBody);
                return false;
            }

            _logger.LogInformation("Environment variables updated for project {ProjectName}", projectName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating environment variables for project {ProjectName}", projectName);
            return false;
        }
    }

    private async Task<bool> DeployProjectAsync(string projectName)
    {
        try
        {
            var request = new DeployRequest
            {
                Build = new BuildConfig
                {
                    Cache = true,
                    Args = new { },
                    Dockerfile = "root",
                    Location = _options.Location
                },
                Cron = [],
                Args = [],
                Port = 8080,
                Type = "docker",
                Disks = [],
                Image = _options.BotImage
            };

            var json = JsonSerializer.Serialize(request);
            _logger.LogInformation("Deploying project {ProjectName} with payload: {Payload}", projectName, json);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(string.Format(LiaraApiUrls.DeployProject, projectName), content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to deploy project: {StatusCode} - {Response}", response.StatusCode, responseBody);
                return false;
            }

            _logger.LogInformation("Project {ProjectName} deployed successfully", projectName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deploying project {ProjectName}", projectName);
            return false;
        }
    }

    private async Task<bool> DeleteProjectAsync(string projectName)
    {
        try
        {
            var response = await _httpClient.DeleteAsync(string.Format(LiaraApiUrls.DeleteProject, projectName));
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to delete project: {StatusCode} - {Response}", response.StatusCode, responseBody);
                return false;
            }

            _logger.LogInformation("Project {ProjectName} deleted successfully", projectName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project {ProjectName}", projectName);
            return false;
        }
    }
}
