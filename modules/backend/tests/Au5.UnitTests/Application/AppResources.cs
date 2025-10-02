namespace Au5.UnitTests.Application;

/// <summary>
/// Application resource strings organized by category.
/// </summary>
internal static class AppResources
{
	public const string DatabaseFailureMessage = "Failed to save record, Pleach check your data and try again.";

	/// <summary>
	/// System configuration related messages.
	/// </summary>
	internal static class System
	{
		public const string FailedToConfig = "Failed to configure the system. Please check your settings and try again.";
		public const string IsNotConfigured = "The system has not been configured yet. Please complete the initial setup.";
		public const string FailedToSetup = "System setup was not completed successfully. Please review the configuration and try again.";
		public const string ThereIsNoAdmin = "No administrator user found. Please create an admin user to continue.";
	}

	/// <summary>
	/// Authentication and authorization related messages.
	/// </summary>
	internal static class Auth
	{
		public const string InvalidUsernameOrPassword = "The username or password you entered is incorrect. Please check your credentials and try again.";
		public const string UnAuthorizedAction = "You are not authorized to perform this action. Please contact your administrator if you believe this is an error.";
	}

	/// <summary>
	/// Meeting related messages.
	/// </summary>
	internal static class Meeting
	{
		public const string FailedToAddBot = "Failed to add bot to the meeting. Please check the bot configuration and try again.";
		public const string NotFound = "The requested meeting could not be found. Please verify the meeting ID and try again.";
		public const string FailedToClose = "Failed to close the meeting. Please try again or contact support if the issue persists.";
		public const string NoContent = "No content is available for this meeting. The meeting may not have started or no transcription data exists.";
		public const string InvalidTranscriptionModel = "Invalid transcription model specified. Please use either 'liveCaption' or 'liveAudio'.";
	}

	/// <summary>
	/// Validation related messages.
	/// </summary>
	internal static class Validation
	{
		public const string Required = "This field is required and cannot be empty.";
		public const string InvalidDirection = "Direction must be either 'ltr' (left-to-right) or 'rtl' (right-to-left).";
		public const string InvalidLanguageFormat = "The language format is invalid. Please use a valid language code (e.g., 'en-US', 'fr-FR').";
		public const string InvalidUrl = "The provided URL is not valid. Please enter a valid URL (e.g., https://example.com).";
		public const string MustBeMoreThanZero = "The value must be greater than zero.";
		public const string InvalidMeetingTranscriptionModel = "Invalid transcription model specified. Please use either 'liveCaption' or 'liveAudio'.";
		public const string InvalidUsernameFormat = "The username format is invalid. Please use only alphanumeric characters and underscores.";
		public const string InvalidPasswordFormat = "Password must be at least 6 characters long and contain a mix of letters and numbers.";
	}

	/// <summary>
	/// Space related messages and codes.
	/// </summary>
	internal static class Space
	{
		public const string NotFoundCode = "Space.NotFound";
		public const string NotFoundMessage = "Space not found";

		public const string ParentNotFoundCode = "Space.ParentNotFound";
		public const string ParentNotFoundMessage = "Parent space not found";

		public const string InvalidUsersCode = "Space.InvalidUsers";
		public const string InvalidUsersMessage = "One or more users not found";

		public const string CreateFailedCode = "Space.CreateFailed";
		public const string CreateFailedMessage = "Failed to create space";

		// Validation messages
		public const string NameRequired = "Space name is required.";
		public const string NameMaxLength = "Space name must not exceed 100 characters.";
		public const string DescriptionMaxLength = "Space description must not exceed 500 characters.";
		public const string InvalidUserIds = "All user IDs must be valid GUIDs.";
	}
}
