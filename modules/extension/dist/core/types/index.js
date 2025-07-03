export const platformRegex = {
    googleMeet: /https:\/\/meet\.google\.com\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3})/
};
export var PostMessageSource;
(function (PostMessageSource) {
    PostMessageSource["ContentScript"] = "Au5-ContentScript";
    PostMessageSource["BackgroundScript"] = "Au5-BackgroundScript";
})(PostMessageSource || (PostMessageSource = {}));
/**
 * Actions that can be triggered by the content script.
 */
export var MessageTypes;
(function (MessageTypes) {
    MessageTypes["UserJoinedInMeeting"] = "UserJoinedInMeeting";
    MessageTypes["BotJoinedInMeeting"] = "BotJoinedInMeeting";
    MessageTypes["Entry"] = "Entry";
    MessageTypes["ReactionApplied"] = "ReactionApplied";
    MessageTypes["GeneralMessage"] = "GeneralMessage";
    MessageTypes["RequestToAddBot"] = "RequestToAddBot";
    MessageTypes["PauseAndPlayTranscription"] = "PauseAndPlayTranscription";
    MessageTypes["MeetingIsActive"] = "MeetingIsActive";
})(MessageTypes || (MessageTypes = {}));
