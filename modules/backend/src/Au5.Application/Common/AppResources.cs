namespace Au5.Application.Common;

/// <summary>
/// Application resource strings organized by category.
/// </summary>
internal static class AppResources
{
	public const string DatabaseFailureMessage = "Failed to save record, Pleach check your data and try again.";

	/// <summary>
	/// System configuration related messages.
	/// </summary>
	internal static class Organization
	{
		public const string FailedToConfig = "Failed to configure the system. Please check your settings and try again.";
		public const string IsNotConfigured = "The system has not been configured yet. Please complete the initial setup.";
		public const string FailedToSetup = "System setup was not completed successfully. Please review the configuration and try again.";
		public const string ThereIsNoAdmin = "No administrator user found. Please create an admin user to continue.";
		public const string FailedToAddAdmin = "Faild to add admin. Please check the data and try again.";
		public const string FailedToSMTPConnection = "Can not connect to SMTP Server.";
	}

	/// <summary>
	/// Authentication and authorization related messages.
	/// </summary>
	internal static class Auth
	{
		public const string InvalidUsernameOrPassword = "The username or password you entered is incorrect. Please check your credentials and try again.";
		public const string UnAuthorizedAction = "You are not authorized to perform this action. Please contact your administrator if you believe this is an error.";
		public const string UserRoleNotFound = "The current user does not have a valid role assigned. Please contact the administrator.";
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
		public const string FailedToToggleFavorite = "Failed to update favorite status. Please try again or contact support if the issue persists.";
		public const string FailedToToggleArchive = "Failed to update archive status. Please try again or contact support if the issue persists.";
		public const string CannotArchiveActiveMeeting = "Cannot archive an active meeting. Only ended meetings can be archived.";
		public const string UnauthorizedToModify = "You are not authorized to modify this meeting. Only meeting participants can perform this action.";
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
		public const string AssistantNameRequired = "Assistant name is required.";
		public const string AssistantNameMaxLength = "Assistant name must not exceed 200 characters.";
		public const string AssistantIconMaxLength = "Assistant icon URL must not exceed 200 characters.";
		public const string AssistantDescriptionMaxLength = "Assistant description must not exceed 500 characters.";
		public const string AssistantInstructionsRequired = "Assistant instructions is required.";
		public const string AssistantInstructionsMaxLength = "Assistant instructions must not exceed 2000 characters.";
	}

	internal static class Admin
	{
		public const string EmailAlreadyRegistered = "An user with this email already exists. Please use a different email address.";
	}

	internal static class User
	{
		public const string EmailAlreadyVerified = "This email address has already been verified. A verification email cannot be sent again.";

		public const string UserNotFound = "User not found. Please verify your information and try again.";

		public const string FailedToUpdateUserInfo = "Failed to Update User.";

		public const string AlreadyExistsInDatabase = "User already exists in the database.";

		public const string FailedToSendInvitationEmail = "Failed to send invitation email.";

		public const string FailedToSaveToDatabase = "Failed to save user data to the database.";
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

		public const string NameRequired = "Space name is required.";
		public const string NameMaxLength = "Space name must not exceed 100 characters.";
		public const string DescriptionMaxLength = "Space description must not exceed 500 characters.";
		public const string InvalidUserIds = "All user IDs must be valid GUIDs.";
	}

	internal static class Assistant
	{
		public const string Code = "Assistant";
		public const string OpenAIConnectionFailed = "Can not connect to OpenAI platform, Please check and try again.";
	}

	/// <summary>
	/// Meeting space related messages.
	/// </summary>
	internal static class MeetingSpace
	{
		public const string MeetingNotFound = "Meeting not found";
		public const string SpaceNotFound = "Space not found";
		public const string MeetingAlreadyInSpace = "Meeting is already added to this space";
		public const string MeetingNotInSpace = "Meeting is not associated with this space";
		public const string AddedSuccessfully = "Meeting successfully added to space";
		public const string RemovedSuccessfully = "Meeting successfully removed from space";
	}
}
