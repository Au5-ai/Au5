export class ChatPanel {
  constructor(companyNameText: string, roomTitleText: string) {
    this.addHeader(companyNameText, roomTitleText);
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
