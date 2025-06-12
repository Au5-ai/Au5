import * as signalR from "@microsoft/signalr";
import { WindowMessageHandler } from "../core/windowMessageHandler.ts.backup";
import { MessageTypes, PostMessageSource } from "../core/types/index";
export class MeetingHubClient {
    connection;
    meetingId;
    config;
    windowMessageHandler;
    constructor(config, meetingId) {
        this.config = config;
        this.meetingId = meetingId;
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.config.service.hubUrl)
            .withAutomaticReconnect()
            .build();
        this.windowMessageHandler = new WindowMessageHandler(PostMessageSource.BackgroundScript, PostMessageSource.ContentScript, this.handleWindowMessage.bind(this));
    }
    startConnection() {
        this.connection
            .start()
            .then(() => {
            this.connection.invoke("JoinMeeting", {
                meetingId: this.meetingId,
                user: {
                    token: this.config.user.token,
                    id: this.config.user.id,
                    fullName: this.config.user.fullName,
                    pictureUrl: this.config.user.pictureUrl
                }
            });
        })
            .then(() => {
            this.setupHandlers();
        })
            .catch(err => {
            console.error("SignalR connection failed:", err);
            return false;
        });
        return true;
    }
    setupHandlers() {
        this.connection.on("ReceiveMessage", (msg) => {
            switch (msg.type) {
                case MessageTypes.NotifyUserJoining:
                case MessageTypes.TranscriptionEntry:
                case MessageTypes.ReactionApplied:
                    this.windowMessageHandler.postToWindow(msg);
                    break;
            }
        });
    }
    handleWindowMessage(action, payload) {
        switch (action) {
            case MessageTypes.ReactionApplied:
                this.connection.invoke(action, payload);
                break;
        }
    }
}
