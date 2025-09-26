namespace Au5.Shared;

public static class VerificationLinkGenerator
{
	public static string Generate(string baseUrl, Guid Id, string email)
	{
		return $"{baseUrl}/exConfig?id={Id}&hash={HashHelper.HashSafe(email)}";
	}
}
