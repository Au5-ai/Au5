import {BackEndApi} from "../api/backEndApi";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import StateManager from "../core/stateManager";
import {
  AppConfiguration,
  BotJoinedInMeetingMessage,
  EntryMessage,
  IMeetingPlatform,
  IMessage,
  MeetingIsActiveMessage,
  MessageTypes,
  PauseAndPlayTranscriptionMessage,
  ReactionAppliedMessage,
  RequestToAddBotMessage,
  UserJoinedInMeetingMessage
} from "../core/types";
import {getCurrentUrl, showToast} from "../core/utils";
import {MeetingHubClient} from "../hub/meetingHubClient";
import {ChatPanel} from "./chatPanel";

export class UIHandlers {
  private meetingHubClient: MeetingHubClient = null as any;
  private config: AppConfiguration;
  private platform: IMeetingPlatform | null = null;
  private chatPanel: ChatPanel;
  private backendApi: BackEndApi;

  constructor(config: AppConfiguration, chatPanel: ChatPanel) {
    this.config = config;
    this.chatPanel = chatPanel;
    this.backendApi = new BackEndApi(config);
    this.handleMessage = this.handleMessage.bind(this);
  }

  init(): this {
    return this.handleJoin()
      .handleReload()
      .handleReactions()
      .handleThemeToggle()
      .handleOptions()
      .handleGithubLink()
      .handleDiscordLink()
      .handleAddIssueLink()
      .handleAddBot()
      .handleMessageSend()
      .handleBotPlayPauseActions()
      .handleTooltips();
  }

  private handleJoin(): this {
    const btn = document.getElementById("au5-btn-joinMeeting") as HTMLButtonElement | null;

    btn?.addEventListener("click", async () => {
      if (!this.config) return;

      const url = await getCurrentUrl();
      this.platform = new MeetingPlatformFactory(url).getPlatform();

      if (!this.platform) {
        this.chatPanel.showNoActiveMeetingContainer(url);
        return;
      }

      this.chatPanel.showTranscriptionContainer();

      this.meetingHubClient = new MeetingHubClient(this.config, this.platform, this.chatPanel);
      this.meetingHubClient.startConnection(this.handleMessage);

      const reactions = await this.backendApi.getReactions();
      if (reactions && reactions.length > 0) {
        this.chatPanel.setReactions(reactions);
      } else {
        console.warn("No reactions found or failed to fetch reactions.");
      }
    });

    return this;
  }

  private handleReload(): this {
    const btn = document.getElementById("au5-btn-reload") as HTMLButtonElement | null;

    btn?.addEventListener("click", async () => {
      const url = await getCurrentUrl();
      this.platform = new MeetingPlatformFactory(url).getPlatform();

      if (!this.platform) {
        this.chatPanel.showNoActiveMeetingContainer(url);
      } else {
        this.chatPanel.showJoinMeetingContainer(url);
      }
    });

    return this;
  }

  private handleReactions(): this {
    document.addEventListener("click", event => {
      const target = event.target as HTMLElement;
      const reaction = target.closest(".au5-reaction");
      if (reaction) {
        const reactionId = Number.parseInt(reaction.getAttribute("reaction-Id")?.toString() || "0");
        const type = reaction.getAttribute("reaction-type");
        const blockId = reaction.getAttribute("data-blockId");
        if (type && blockId) {
          this.meetingHubClient?.sendMessage({
            type: MessageTypes.ReactionApplied,
            meetId: this.platform?.getMeetId(),
            blockId: blockId,
            user: {
              id: this.config.user.id,
              fullName: this.config.user.fullName,
              pictureUrl: this.config.user.pictureUrl,
              hasAccount: this.config.user.hasAccount
            },
            reactionId: reactionId,
            reactionType: type
          } as ReactionAppliedMessage);
          this.chatPanel.addReaction({
            type: MessageTypes.ReactionApplied,
            blockId: blockId,
            user: {
              id: this.config.user.id,
              fullName: this.config.user.fullName,
              pictureUrl: this.config.user.pictureUrl,
              hasAccount: this.config.user.hasAccount
            },
            reactionId: reactionId,
            reactionType: type
          });
        }
      }
    });
    return this;
  }

  private handleThemeToggle(): this {
    const toggle = document.getElementById("au5-theme-toggle");
    toggle?.addEventListener("click", () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute("data-gpts-theme");
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      StateManager.getInstance().setTheme(nextTheme);
      html.setAttribute("data-gpts-theme", nextTheme);

      document
        .getElementById("darkmode")
        ?.setAttribute("style", `display: ${nextTheme === "dark" ? "inline" : "none"};`);
      document
        .getElementById("lightmode")
        ?.setAttribute("style", `display: ${nextTheme === "light" ? "inline" : "none"};`);
    });
    return this;
  }

  private handleOptions(): this {
    const btn = document.getElementById("au5-btn-login");
    btn?.addEventListener("click", () => window.open(this.config.service.panelUrl, "_blank"));
    return this;
  }

  private handleGithubLink(): this {
    const btn = document.getElementById("github-link");
    btn?.addEventListener("click", () => window.open("https://github.com/Au5-ai/Au5", "_blank"));
    return this;
  }

  private handleDiscordLink(): this {
    const btn = document.getElementById("discord-link");
    btn?.addEventListener("click", () => window.open("https://discord.com/channels/1385091638422016101", "_blank"));
    return this;
  }

  private handleAddIssueLink(): this {
    const btn = document.getElementById("issue-link");
    btn?.addEventListener("click", () => window.open("https://github.com/Au5-ai/Au5/issues", "_blank"));
    return this;
  }

  private handleAddBot(): this {
    let disabled = false;
    const btn = document.getElementById("au5-btn-addbot") as HTMLButtonElement | null;
    btn?.addEventListener("click", async () => {
      if (disabled) {
        console.warn("Button is disabled, please wait before retrying.");
        return;
      }
      if (!this.platform || !this.config) {
        console.error("Platform or configuration is not set.");
        return;
      }
      const meetId = this.platform.getMeetId();
      const response = await this.backendApi
        .addBot({
          meetId: meetId,
          botName: this.config.service.botName,
          platform: this.platform.getPlatformName()
        })
        .catch(error => {
          showToast("Failed to add bot :(");
          return;
        });

      if (response) {
        const message = {
          type: MessageTypes.RequestToAddBot,
          meetId: meetId,
          botName: this.config.service.botName,
          user: this.config.user
        } as RequestToAddBotMessage;
        this.meetingHubClient?.sendMessage(message);

        const addBotText = document.getElementById("au5-btn-addbot-text");
        if (addBotText) {
          let seconds = 60;
          disabled = true;
          addBotText.textContent = `${seconds}s to retry`;
          const interval = setInterval(() => {
            seconds--;
            if (seconds > 0) {
              addBotText.textContent = `${seconds}s to retry`;
            } else {
              clearInterval(interval);
              disabled = false;
              addBotText.textContent = "Add bot";
            }
          }, 1000);
        }
      } else {
        console.error("Failed to add bot:", response.error);
      }
    });
    return this;
  }

  private handleMessageSend(): this {
    const btn = document.getElementById("au5-btn-sendMessage") as HTMLButtonElement | null;
    const input = document.getElementById("au5-input-message") as HTMLInputElement | null;

    btn?.addEventListener("click", () => {
      if (input && input.value.trim()) {
        const state = StateManager.getInstance().getState();
        if (state.isConnected === false) {
          showToast("Cannot send message: Connection is not established.");
          return this;
        }

        if (state.isBotContainerVisible === true) {
          this.chatPanel.removeBotContainer();
        }

        const entry: EntryMessage = {
          type: MessageTypes.Entry,
          meetId: this.platform?.getMeetId(),
          blockId: crypto.randomUUID(),
          participant: {
            id: this.config.user.id,
            fullName: this.config.user.fullName,
            pictureUrl: this.config.user.pictureUrl,
            hasAccount: this.config.user.hasAccount
          },
          content: input.value.trim(),
          timestamp: new Date(),
          entryType: "Chat"
        };
        this.meetingHubClient?.sendMessage(entry);
        this.chatPanel.addEntry(entry);
        input.value = "";
      }
    });
    return this;
  }

  private handleTooltips(): this {
    const tooltips = document.querySelectorAll("[data-tooltip]");
    tooltips.forEach(tooltip => {
      const tooltipText = tooltip.getAttribute("data-tooltip");
      if (tooltipText) {
        tooltip.addEventListener("mouseenter", () => {
          const tooltipEl = document.createElement("div");
          tooltipEl.className = "au5-tooltip";
          tooltipEl.innerText = tooltipText;
          document.body.appendChild(tooltipEl);

          const rect = tooltip.getBoundingClientRect();
          tooltipEl.style.left = `${rect.left + window.scrollX}px`;
          tooltipEl.style.top = `${rect.top + window.scrollY - tooltipEl.offsetHeight - 8}px`;

          requestAnimationFrame(() => {
            tooltipEl.style.left = `${rect.left + window.scrollX}px`;
            tooltipEl.style.top = `${rect.top + window.scrollY - tooltipEl.offsetHeight - 8}px`;
          });

          tooltip.addEventListener(
            "mouseleave",
            () => {
              document.body.removeChild(tooltipEl);
            },
            {once: true}
          );
        });
      }
    });
    return this;
  }

  private handleBotPlayPauseActions(): this {
    const botPlayAction = document.getElementById("au5-bot-playAction") as HTMLDivElement | null;
    const botPauseAction = document.getElementById("au5-bot-puaseAction") as HTMLDivElement | null;

    botPlayAction?.addEventListener("click", () => {
      if (!this.platform || !this.meetingHubClient) return;
      const message: PauseAndPlayTranscriptionMessage = {
        type: MessageTypes.PauseAndPlayTranscription,
        meetId: this.platform.getMeetId(),
        isPaused: false,
        user: {
          id: this.config.user.id,
          fullName: this.config.user.fullName,
          pictureUrl: this.config.user.pictureUrl,
          hasAccount: this.config.user.hasAccount
        }
      };
      this.meetingHubClient.sendMessage(message);
      this.chatPanel.pauseAndPlay(message);
    });

    botPauseAction?.addEventListener("click", () => {
      if (!this.platform || !this.meetingHubClient) return;
      const message: PauseAndPlayTranscriptionMessage = {
        type: MessageTypes.PauseAndPlayTranscription,
        meetId: this.platform.getMeetId(),
        isPaused: true,
        user: {
          id: this.config.user.id,
          fullName: this.config.user.fullName,
          pictureUrl: this.config.user.pictureUrl,
          hasAccount: this.config.user.hasAccount
        }
      };
      this.meetingHubClient.sendMessage(message);
      this.chatPanel.pauseAndPlay(message);
    });

    return this;
  }

  private handleMessage(msg: IMessage): void {
    switch (msg.type) {
      case MessageTypes.BotJoinedInMeeting:
        const botJoinedMsg = msg as BotJoinedInMeetingMessage;
        this.chatPanel.botJoined(botJoinedMsg.botName);
        break;

      case MessageTypes.Entry:
        const transcriptEntry = msg as EntryMessage;
        this.chatPanel.addEntry({
          meetId: transcriptEntry.meetId,
          blockId: transcriptEntry.blockId,
          participant: transcriptEntry.participant,
          content: transcriptEntry.content,
          entryType: transcriptEntry.entryType,
          timestamp: transcriptEntry.timestamp
        });
        break;

      case MessageTypes.UserJoinedInMeeting:
        const userJoinedMsg = msg as UserJoinedInMeetingMessage;
        if (!userJoinedMsg.user) {
          return;
        }
        this.chatPanel.usersJoined(userJoinedMsg.user.fullName);
        break;

      case MessageTypes.ReactionApplied:
        const reactionMsg = msg as ReactionAppliedMessage;
        if (!reactionMsg.meetId || !reactionMsg.blockId || !reactionMsg.user || !reactionMsg.reactionType) {
          return;
        }
        this.chatPanel.addReaction(reactionMsg);
        break;

      case MessageTypes.RequestToAddBot:
        const requestToAddBotMsg = msg as RequestToAddBotMessage;
        this.chatPanel.botRequested(requestToAddBotMsg);
        break;

      case MessageTypes.PauseAndPlayTranscription:
        const pauseAndPlayTranscription = msg as PauseAndPlayTranscriptionMessage;
        this.chatPanel.pauseAndPlay(pauseAndPlayTranscription);
        break;

      case MessageTypes.MeetingIsActive:
        const meetingIsActive = msg as MeetingIsActiveMessage;
        this.chatPanel.botJoined(meetingIsActive.botName);
        break;

      default:
        break;
    }
  }
}
