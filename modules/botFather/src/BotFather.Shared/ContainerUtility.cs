namespace BotFather.Shared;

public static class ContainerUtility
{
    public static string GenerateContainerName(string meetId, string hashToken)
    {
        var fullName = $"bot-{meetId}-{hashToken}";
        return fullName[..Math.Min(50, fullName.Length)].ToLower();
    }
}
