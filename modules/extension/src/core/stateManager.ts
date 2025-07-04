import {GLobalState, PageState} from "./types";

class StateManager {
  private static instance: StateManager;
  private state: GLobalState = {
    isConnected: false,
    page: PageState.NoActiveMeeting,
    isBotAdded: false,
    isTranscriptionPaused: false,
    isBotContainerVisible: true
  };

  private constructor() {}

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  public getState(): GLobalState {
    return {...this.state};
  }

  public setConnected(isConnected: boolean): void {
    this.state.isConnected = isConnected;
  }

  public setPage(page: PageState): void {
    this.state.page = page;
  }

  public setBotAdded(isBotAdded: boolean): void {
    this.state.isBotAdded = isBotAdded;
  }

  public pauseTranscription(isPaused: boolean): void {
    this.state.isTranscriptionPaused = isPaused;
  }

  public disableBotContainer(): void {
    this.state.isBotContainerVisible = false;
  }
}

export default StateManager;
