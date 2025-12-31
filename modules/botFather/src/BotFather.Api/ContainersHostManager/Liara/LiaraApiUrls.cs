namespace BotFather.Api.ContainersHostManager.Liara;

public static class LiaraApiUrls
{
	public const string BaseUrl = "https://api.iran.liara.ir";
	public const string CreateProject = "/v1/projects";
	public const string UpdateEnvs = "/v1/projects/update-envs";
	public const string DeployProject = "/v2/projects/{0}/releases";
	public const string DeleteProject = "/v1/projects/{0}";
}
