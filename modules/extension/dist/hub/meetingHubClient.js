import * as signalR from "@microsoft/signalr";
import { MessageTypes } from "../core/types";
export class MeetingHubClient {
    connection;
    meetingId;
    config;
    platform;
    chatPanel;
    constructor(config, platform, chatPanel) {
        this.config = config;
        this.platform = platform;
        this.meetingId = platform.getMeetingId();
        this.chatPanel = chatPanel;
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.config.service.hubUrl)
            .withAutomaticReconnect()
            .build();
    }
    startConnection(messageHandler) {
        this.connection
            .start()
            .then(() => {
            this.connection.invoke(MessageTypes.UserJoinedInMeeting, {
                meetingId: this.meetingId,
                user: {
                    id: this.config.user.id,
                    fullName: this.config.user.fullName,
                    pictureUrl: this.config.user.pictureUrl
                },
                platform: this.platform.getPlatformName()
            });
        })
            .then(() => {
            this.connection.on("ReceiveMessage", (msg) => {
                messageHandler(msg);
            });
        })
            .catch(err => {
            console.error("SignalR connection failed:", err);
            return false;
        });
        return true;
    }
    async sendMessage(payload) {
        try {
            await this.connection.invoke(payload.type, payload);
        }
        catch (err) {
            console.error(`[SignalR] Failed to send message (${payload.type}):`, err);
        }
    }
    onDisconnect(handler) {
        this.connection.onclose(error => {
            this.chatPanel.isOffline();
        });
    }
}
