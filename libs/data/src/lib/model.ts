export interface Choice {
  id: string;
  text: string
}

export interface Card {
  id: string;
  stelling: string;
  keuzes: Choice[];
  wie: 'Vriend'|'Kennis'|'Idool'|'Onbekende';
  waar: 'online'|'irl';
  keuzeId?: string;
  sortKey?: string;
  position: Position;
  emojiStory: string;
}

export interface UserInfoType {
  gender: string;
  group: string;
}

export interface StateToStore {
  activity: Activity,
  state: State,
  userInfo: UserInfoType,
  cards: {
    id: string;
    keuzeId?: string;
    sortKey?: string;
    position: Position;
  }[]
}


export interface Position {
  top: number; left: number;
}

export interface Activity {
  code: string;
  state: ActivityState;
  createdBy: string;
  startedDate: Date;
  finishedDate?: Date;
}

export interface SortBoardStateModel {
  activity: Activity;
  user: UserInfo;
  userInfo: UserInfoType,
  cards: Card[];
  state: State;
  done: boolean;
  loading: boolean;
};

export interface UserInfo {
  id: string;
  token: string;
  activityCode: string;
  avatarIndex: number;
  teacherId: string;
  demoUser: boolean;
}

export enum State {
  order = 0,
  sort = 1,
  done = 2,
  stopped = 3
}

export enum ActivityState {
  inprogress = 0,
  done = 1
}