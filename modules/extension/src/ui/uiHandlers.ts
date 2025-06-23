import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {
  IMessage,
  MessageTypes,
  ReactionAppliedMessage,
  TranscriptionEntryMessage,
  UserJoinedInMeetingMessage
} from "../core/types";
import {getCurrentUrl} from "../core/utils";
import {MeetingHubClient} from "../hub/meetingHubClient";

export class UIHandlers {
  private meetingHubClient: MeetingHubClient = null as any;
  private config: any;
  private platform: any;
  private chatPanel: any;

  constructor(config: any, platform: any, chatPanel: any) {
    this.config = config;
    this.platform = platform;
    this.chatPanel = chatPanel;
  }

  init(): this {
    return this.handleJoin()
      .handleReload()
      .handleReactions()
      .handleThemeToggle()
      .handleOptions()
      .handleGithubLink()
      .handleDiscordLink()
      .handleMessageSend()
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

      this.meetingHubClient = new MeetingHubClient(this.config, this.platform.getMeetingId());
      const isConnected = this.meetingHubClient.startConnection(this.handleMessage);

      if (!isConnected) {
        console.error("Failed to connect to the meeting hub.");
        return;
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
        const type = reaction.getAttribute("reaction-type");
        const blockId = reaction.getAttribute("data-blockId");
        if (type && blockId) {
          this.meetingHubClient?.sendMessage({
            type: MessageTypes.ReactionApplied,
            meetingId: this.platform?.getMeetingId(),
            transcriptBlockId: blockId,
            user: {
              fullName: this.config.user.fullName,
              pictureUrl: this.config.user.pictureUrl
            },
            reactionType: type
          } as ReactionAppliedMessage);
          this.chatPanel.addReaction({
            type: MessageTypes.ReactionApplied,
            transcriptBlockId: blockId,
            user: {
              fullName: this.config.user.fullName,
              pictureUrl: this.config.user.pictureUrl
            },
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
    const btn = document.getElementById("au5-btn-options");
    btn?.addEventListener("click", () => window.open("options.html", "_blank"));
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

  private handleMessageSend(): this {
    const btn = document.getElementById("au5-btn-sendMessage") as HTMLButtonElement | null;
    const input = document.getElementById("au5-input-message") as HTMLInputElement | null;
    console.log("Button and input elements:", btn, input);
    btn?.addEventListener("click", () => {
      console.log("Send message button clicked");
      if (input && input.value.trim()) {
        const message = {
          type: MessageTypes.TranscriptionEntry,
          meetingId: this.platform?.getMeetingId(),
          transcriptBlockId: crypto.randomUUID(),
          speaker: {
            fullName: this.config.user.fullName,
            pictureUrl: this.config.user.pictureUrl
          },
          transcript: input.value.trim(),
          timestamp: new Date()
        };
        console.log("Sending message:", message);
        this.meetingHubClient?.sendMessage(message);
        this.chatPanel.addTranscription(message);
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

  private handleMessage(msg: IMessage): void {
    switch (msg.type) {
      case MessageTypes.TranscriptionEntry:
        const transcriptEntry = msg as TranscriptionEntryMessage;

        this.chatPanel.addTranscription({
          meetingId: transcriptEntry.meetingId,
          transcriptBlockId: transcriptEntry.transcriptBlockId,
          speaker: transcriptEntry.speaker,
          transcript: transcriptEntry.transcript,
          timestamp: transcriptEntry.timestamp
        });
        break;

      case MessageTypes.NotifyUserJoining:
        const userJoinedMsg = msg as UserJoinedInMeetingMessage;

        if (!userJoinedMsg.user) {
          return;
        }

        this.chatPanel.usersJoined({
          type: MessageTypes.NotifyUserJoining,
          user: {
            id: userJoinedMsg.user.id,
            fullName: userJoinedMsg.user.fullName,
            pictureUrl: userJoinedMsg.user.pictureUrl
          }
        });
        break;

      case MessageTypes.ReactionApplied:
        const reactionMsg = msg as ReactionAppliedMessage;
        if (
          !reactionMsg.meetingId ||
          !reactionMsg.transcriptBlockId ||
          !reactionMsg.user ||
          !reactionMsg.reactionType
        ) {
          return;
        }
        this.chatPanel.addReaction(reactionMsg);
        break;
      default:
        break;
    }
  }
}
