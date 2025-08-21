namespace Au5.IntegrationTests;

public class EmbededResources
{
	public static Stream GetEmbeddedResource(string resourceName)
	{
		var assembly = typeof(IntegrationTestWebApp).Assembly;
		var fullResourceName = $"Au5.IntegrationTests.TestFiles.{resourceName}";
		var resource = assembly.GetManifestResourceStream(fullResourceName);
		return resource ?? throw new InvalidOperationException($"Could not locate embedded resource '{fullResourceName}'");
	}

	public static string GetEmbeddedResourceAsString(string resourceName)
	{
		using var stream = GetEmbeddedResource(resourceName);
		using var streamReader = new StreamReader(stream);
		return streamReader.ReadToEnd();
	}

	public static byte[] GetEmbeddedResourceAsByteArray(string resourceName)
	{
		var buffer = new byte[16 * 1024];
		using var stream = GetEmbeddedResource(resourceName);

		using var memoryStream = new MemoryStream();
		int read;
		while ((read = stream.Read(buffer, 0, buffer.Length)) > 0)
		{
			memoryStream.Write(buffer, 0, read);
		}

		return memoryStream.ToArray();
	}
}
