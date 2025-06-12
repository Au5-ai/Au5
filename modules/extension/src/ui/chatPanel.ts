export class ChatPanel {
  private noActiveMeetingEl: HTMLElement | null;
  private activeMeetingButNotStartedEl: HTMLElement | null;
  private activeMeetingEl: HTMLElement | null;

  constructor(companyNameText: string, roomTitleText: string) {
    this.addHeader(companyNameText, roomTitleText);

    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");
  }

  public showJoinMeeting(): void {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("au5-hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("au5-hidden");
    if (this.activeMeetingEl) this.activeMeetingEl.classList.add("au5-hidden");
  }

  public showNoActiveMeeting(): void {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("au5-hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("au5-hidden");
    if (this.activeMeetingEl) this.activeMeetingEl.classList.add("au5-hidden");
  }
  private addHeader(companyNameText: string, roomTitleText: string): void {
    const headerElement = document.querySelector(".au5-header") as HTMLElement;
    if (!headerElement) return;

    const headerLeft = document.createElement("div");
    headerLeft.className = "au5-header-left";

    const companyAvatar = document.createElement("div");
    companyAvatar.className = "au5-company-avatar";
    companyAvatar.textContent = "A";

    const infoContainer = document.createElement("div");

    const companyName = document.createElement("div");
    companyName.className = "au5-company-name";
    companyName.textContent = companyNameText;

    const roomTitle = document.createElement("div");
    roomTitle.className = "au5-room-title";
    roomTitle.textContent = roomTitleText;

    infoContainer.appendChild(companyName);
    infoContainer.appendChild(roomTitle);

    headerLeft.appendChild(companyAvatar);
    headerLeft.appendChild(infoContainer);

    headerElement.appendChild(headerLeft);
  }
}
