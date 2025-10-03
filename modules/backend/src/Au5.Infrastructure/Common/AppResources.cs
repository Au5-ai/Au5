namespace Au5.Infrastructure.Common;

/// <summary>
/// Infrastructure layer resource strings organized by category and component.
/// </summary>
internal static class AppResources
{
	/// <summary>
	/// Bot management related messages.
	/// </summary>
	internal static class BotFather
	{
		public const string FailedToAdd = "Failed to add bot to the meeting. Please check the bot service status and try again.";
		public const string FailedToRemove = "Failed to remove bot from the meeting. Please try again or contact support if the issue persists.";
		public const string FailedCommunicateWithBotFather = "Unable to communicate with the BotFather service. Please check the service status and network connectivity.";
	}

	internal static class AIEngine
	{
		public const string FailedToAdd = "Failed to add AI assistant. Please check the service status and try again.";
		public const string FailedCommunicate = "Unable to communicate with the AIEngine service. Please check the service status and network connectivity.";
	}
}
