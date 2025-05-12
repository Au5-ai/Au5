export default class ChatPanel {
  private static chatPanel: HTMLDivElement | null = null;

  public static create(): void {
    if (this.chatPanel) {
      console.warn("ChatPanel already exists.");
      return;
    }

    this.chatPanel = document.createElement("div");
    this.chatPanel.id = "au5-chat-panel";
    Object.assign(this.chatPanel.style, {
      border: "1px solid transparent",
      alignItems: "center",
      backgroundColor: "var(--hotlane-background-color)",
      borderRadius: "16px",
      bottom: "80px",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      maxWidth: "100%",
      overflow: "hidden",
      position: "absolute",
      right: "16px",
      top: "16px",
      transform: "none",
      zIndex: "9999",
      transition: "transform .5s cubic-bezier(.4,0,.2,1), bottom .5s cubic-bezier(0.4,0,0.2,1)",
      width: "360px"
    });

    document.body.appendChild(this.chatPanel);

    // const elementsToStyle = [
    //   {className: "fJsklc ZmuLbd Didmac G03iKb", styles: {top: "0px", right: "376px", left: "0px"}},
    //   {className: "axUSnc cZXVke  P9KVBf", styles: {inset: "72px 392px 80px 16px"}}
    // ];

    // elementsToStyle.forEach(({className, styles}) => {
    //   const elements = document.getElementsByClassName(className);
    //   Array.from(elements).forEach(element => {
    //     Object.assign((element as HTMLElement).style, styles);
    //   });
    // });

    // const element = document.getElementsByClassName("dkjMxf i8wGAe iPFm3e")[0] as HTMLElement;
    // if (element) {
    //   element.style.width = parseInt(element.style.width, 10) - 376 + "px";
    // }
  }

  public static destroy(): void {
    if (this.chatPanel) {
      document.body.removeChild(this.chatPanel);
      this.chatPanel = null;
    } else {
      console.warn("ChatPanel does not exist.");
    }
  }
}
