import "./ui/styles.css";

class MeetSpeechAssistant {
  private recognition: SpeechRecognition;
  private isActive: boolean = false;
  private uiContainer: HTMLDivElement;
  private transcriptContainer: HTMLDivElement;
  private toggleButton: HTMLButtonElement;

  constructor() {
    this.initializeUI();
    this.setupRecognition();
    this.injectStyles();
  }

  private initializeUI(): void {
    this.uiContainer = document.createElement("div");
    this.uiContainer.id = "meet-speech-assistant-container";

    this.transcriptContainer = document.createElement("div");
    this.transcriptContainer.id = "meet-speech-transcript";
    this.transcriptContainer.textContent =
      "Click the microphone to start listening...";

    this.toggleButton = document.createElement("button");
    this.toggleButton.id = "meet-speech-toggle";
    this.toggleButton.innerHTML = "🎤";
    this.toggleButton.addEventListener("click", () => this.toggleRecognition());

    this.uiContainer.appendChild(this.transcriptContainer);
    this.uiContainer.appendChild(this.toggleButton);

    // Try to find the meet controls area or fallback to body
    const controlsArea = document.querySelector(".G3llAf") || document.body;
    controlsArea.appendChild(this.uiContainer);
  }

  private setupRecognition(): void {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US"; // Default, can be changed

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      this.transcriptContainer.textContent = transcript;
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      this.transcriptContainer.textContent = `Error: ${event.error}`;
      this.stopRecognition();
    };
  }

  private injectStyles(): void {
    const style = document.createElement("style");
    style.textContent = `
      #meet-speech-assistant-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
      }
      #meet-speech-toggle {
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 18px;
        cursor: pointer;
      }
      #meet-speech-toggle.active {
        background: #d93025;
      }
      #meet-speech-transcript {
        margin-bottom: 10px;
        max-width: 300px;
        max-height: 200px;
        overflow-y: auto;
      }
    `;
    document.head.appendChild(style);
  }

  private startRecognition(): void {
    try {
      this.recognition.start();
      this.isActive = true;
      this.toggleButton.classList.add("active");
      this.transcriptContainer.textContent = "Listening...";
    } catch (error) {
      console.error("Failed to start recognition:", error);
    }
  }

  private stopRecognition(): void {
    this.recognition.stop();
    this.isActive = false;
    this.toggleButton.classList.remove("active");
  }

  private toggleRecognition(): void {
    if (this.isActive) {
      this.stopRecognition();
    } else {
      this.startRecognition();
    }
  }
}

// Wait for Meet to load before initializing
const checkInterval = setInterval(() => {
  if (document.querySelector(".G3llAf")) {
    // Meet controls container
    clearInterval(checkInterval);
    new MeetSpeechAssistant();
  }
}, 1000);
