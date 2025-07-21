import {Participant} from "../core/types";

export interface RequestAddBotModel {
  meetId: string;
  botName: string;
  user: Participant;
}
