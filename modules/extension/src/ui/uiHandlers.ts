import {BackEndApi} from "../api/backEndApi";
import {CloseMeetingModel} from "../api/types";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import StateManager from "../core/stateManager";
import {
  AppConfiguration,
  BotJoinedInMeetingMessage,
  CloseMeetingMessage,
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
      .handleMeetingCloseActions()
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
              pictureUrl: this.config.user.pictureUrl
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
              pictureUrl: this.config.user.pictureUrl
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
    btn?.addEventListener("click", () => window.open("https://github.com/Au5-ai/au5", "_blank", "noopener,noreferrer"));
    return this;
  }

  private handleDiscordLink(): this {
    const btn = document.getElementById("discord-link");
    btn?.addEventListener("click", () => window.open("https://discord.com/channels/1385091638422016101", "_blank"));
    return this;
  }

  private handleAddIssueLink(): this {
    const btn = document.getElementById("issue-link");
    btn?.addEventListener("click", () =>
      window.open("https://github.com/Au5-ai/au5/issues", "_blank", "noopener,noreferrer")
    );
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

      const addBotText = document.getElementById("au5-btn-addbot-text");
      if (addBotText) {
        disabled = true;
        addBotText.textContent = "Loading...";
      }

      const meetId = this.platform.getMeetId();
      const response = await this.backendApi
        .addBot({
          meetId: meetId,
          platform: this.platform.getPlatformName()
        })
        .catch(error => {
          showToast("Failed to add bot :(");
          if (addBotText) {
            disabled = false;
            addBotText.textContent = "Add bot";
          }
          return;
        });

      if (response) {
        localStorage.setItem("au5-meetingId", JSON.stringify(response));
        const message = {
          type: MessageTypes.RequestToAddBot,
          meetId: meetId,
          user: this.config.user
        } as RequestToAddBotMessage;
        this.meetingHubClient?.sendMessage(message);

        if (addBotText) {
          let seconds = 120;
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
        console.error("Failed to add bot:", response?.error);
        if (addBotText) {
          disabled = false;
          addBotText.textContent = "Add bot";
        }
      }
    });
    return this;
  }

  private handleMessageSend(): this {
    const btn = document.getElementById("au5-btn-sendMessage") as HTMLButtonElement | null;
    const input = document.getElementById("au5-input-message") as HTMLInputElement | null;

    const sendMessage = () => {
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
            pictureUrl: this.config.user.pictureUrl
          },
          content: input.value.trim(),
          timestamp: new Date(),
          entryType: "Chat"
        };
        this.meetingHubClient?.sendMessage(entry);
        this.chatPanel.addEntry(entry);
        input.value = "";
      }
    };

    btn?.addEventListener("click", sendMessage);

    input?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.ctrlKey) {
        e.preventDefault();
        sendMessage();
      } else if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const value = input.value;
        input.value = value.substring(0, start) + "\n" + value.substring(end);
        input.selectionStart = input.selectionEnd = start + 1;
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
    const botPauseAction = document.getElementById("au5-bot-pauseAction") as HTMLDivElement | null;

    botPlayAction?.addEventListener("click", () => {
      if (!this.platform || !this.meetingHubClient) return;
      const message: PauseAndPlayTranscriptionMessage = {
        type: MessageTypes.PauseAndPlayTranscription,
        meetId: this.platform.getMeetId(),
        isPaused: false,
        user: {
          id: this.config.user.id,
          fullName: this.config.user.fullName,
          pictureUrl: this.config.user.pictureUrl
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
          pictureUrl: this.config.user.pictureUrl
        }
      };
      this.meetingHubClient.sendMessage(message);
      this.chatPanel.pauseAndPlay(message);
    });

    return this;
  }

  private handleMeetingCloseActions(): this {
    let disabled = false;
    const meetingCloseAction = document.getElementById("au5-meeting-closeAction") as HTMLDivElement | null;

    meetingCloseAction?.addEventListener("click", async () => {
      if (disabled) {
        console.warn("Close action is disabled, please wait.");
        return;
      }
      if (!this.platform || !this.meetingHubClient) return;

      const meeting = JSON.parse(localStorage.getItem("au5-meetingId") || "null");
      if (!meeting) {
        return;
      }

      disabled = true;
      const originalTooltip = meetingCloseAction.getAttribute("data-tooltip");
      meetingCloseAction.setAttribute("data-tooltip", "Closing...");
      meetingCloseAction.style.opacity = "0.6";
      meetingCloseAction.style.cursor = "wait";

      const meetId = this.platform?.getMeetId();
      const meetingModel: CloseMeetingModel = {
        meetId: meetId,
        meetingId: meeting.meetingId
      };

      try {
        await this.backendApi.closeMeeting(meetingModel);

        const message = {
          type: MessageTypes.CloseMeeting,
          meetId: meetId
        } as CloseMeetingMessage;

        this.meetingHubClient.sendMessage(message);
        this.closeSidePanel(this.config.service.panelUrl);
      } catch (error) {
        showToast("Failed to close meeting :(");
        disabled = false;
        meetingCloseAction.setAttribute("data-tooltip", originalTooltip || "Close Meeting");
        meetingCloseAction.style.opacity = "1";
        meetingCloseAction.style.cursor = "pointer";
      }
    });
    return this;
  }

  private closeSidePanel(panelUrl: string, meetingId: string = "", meetId: string = "") {
    localStorage.removeItem("au5-meetingId");

    if (meetingId && meetId) {
      panelUrl = panelUrl + `/meetings/${meetingId}/sessions/${meetId}/transcription`;
    } else {
      panelUrl = panelUrl + "/meetings/my";
    }
    chrome.runtime.sendMessage({
      action: "CLOSE_SIDEPANEL",
      panelUrl: panelUrl
    });
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
      case MessageTypes.CloseMeeting:
        const closeMeeting = msg as CloseMeetingMessage;
        this.closeSidePanel(
          this.config.service.panelUrl,
          localStorage.getItem("au5-meetingId") ?? "",
          closeMeeting.meetId
        );
        break;
      default:
        break;
    }
  }
}
