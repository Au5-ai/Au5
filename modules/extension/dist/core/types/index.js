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
    MessageTypes["TranscriptionEntry"] = "TranscriptionEntry";
    MessageTypes["NotifyUserJoining"] = "NotifyUserJoining";
    MessageTypes["ReactionApplied"] = "ReactionApplied";
})(MessageTypes || (MessageTypes = {}));
