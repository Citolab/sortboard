import { data, SortBoardStateModel, State, Position, isDefined, Activity, UserInfo, DATABASE, StateToStore, UserInfoType } from '@sortboard/data';
import { createStore, ActionType, StateContextType } from 'rx-firebase-store';
import { environment } from '../environments/environment';

export const initialState: SortBoardStateModel = {
    activity: null,
    user: null,
    userInfo: null,
    cards: data.map((d, index) => ({
        ...d,
        drop: { dx: 0, dy: 0 },
        containerId: null,
        keuzeId: null,
        keuzeTekst: '',
        position: { left: 840 / 2 - 80 , top: 140 - (index * -2) + (index * 2 / 2) }
    })),
    done: false,
    state: State.order,
    loading: true
};

export class RestoreStateAction implements ActionType<SortBoardStateModel, never> {
    type = 'RESTORE_STATE';

    execute = async (ctx: StateContextType<SortBoardStateModel>) => {
        if (ctx.auth.currentUser?.uid) {
            const storedState = await ctx.getCustomState<StateToStore>();
            if (storedState) {
                return ctx.patchState({
                    activity: storedState.activity,
                    state: storedState.state,
                    userInfo: storedState.userInfo,
                    done: isDone(storedState.cards, storedState.state),
                    cards: storedState.cards.map(c => {
                        const cardDef = data.find(d => d.id === c.id);
                        return { ...cardDef, ...c };
                    }),
                    loading: false
                });
            }
        }
        return ctx.patchState({loading: false});
    }
}

export class ToSortStateAction implements ActionType<SortBoardStateModel, never> {
    type = 'CHANGE_TO_SORT_STATE';
    execute = async (ctx: StateContextType<SortBoardStateModel>) => {
        const patchedState = await ctx.patchState({ state: State.sort, done: false });
        persist(patchedState, ctx);
        return patchedState;
    }
}

export class EndSortStateAction implements ActionType<SortBoardStateModel, never> {
    type = 'CHANGE_TO_END_STATE';
    execute = async (ctx: StateContextType<SortBoardStateModel>) => {
        const patchedState = await ctx.patchState({ state: State.done });
        persist(patchedState, ctx);
        return patchedState;
    }
}

export class ResetStateAction implements ActionType<SortBoardStateModel, never> {
    type = 'RESET_STATE';
    neverStoreOrLog = true;

    async execute(ctx: StateContextType<SortBoardStateModel>): Promise<SortBoardStateModel> {
        return ctx.setState(initialState);
    }
}


export class SetInitialStateAction implements ActionType<SortBoardStateModel, { activity: Activity, user: UserInfo }> {
    type = 'SET_INITIAL_STATE';

    constructor(public payload: { activity: Activity, user: UserInfo }) { }

    async execute(ctx: StateContextType<SortBoardStateModel>): Promise<SortBoardStateModel> {
        const newState = await ctx.setState({ ...initialState, loading: false, activity: this.payload.activity, user: this.payload.user });
        persist(newState, ctx);
        return Promise.resolve(newState);
    }
}

export class CardMovedAction implements ActionType<SortBoardStateModel, { cardId: string, position: Position }> {
    type = 'CARD_MOVED';

    constructor(public payload: { cardId: string; position: Position }) { }

    execute(ctx: StateContextType<SortBoardStateModel>) {
        const currentState = ctx.getState();
        const cardId = this.payload.cardId;
        const position = this.payload.position;
        const defCard = data.find(d => d.id === this.payload.cardId);
        if (!currentState.cards.find(c => c.id === cardId)) {
            currentState.cards.push({
                ...defCard, keuzeId: null, sortKey: ''
            });
        }
        const cards = currentState.cards.map(card => {
            if (card.id === cardId) {
                return { ...card, position };
            }
            return card;
        })
        return ctx.patchState({ cards });
    }
}

export class SetUserInfoAction implements ActionType<SortBoardStateModel, UserInfoType> {
    type = 'SET_USER_INFO';
    constructor(public payload: UserInfoType) { };

    async execute(ctx: StateContextType<SortBoardStateModel>) {
        const patchedState = await ctx.patchState({ userInfo: this.payload });
        persist(patchedState, ctx);
        return patchedState;
    }
}

export class SelectCardAction implements ActionType<SortBoardStateModel, { cardId: string }> {
    type = 'CARD_SELECTED';

    constructor(public payload: { cardId: string }) { };

    execute(ctx: StateContextType<SortBoardStateModel>) {
        const currentState = ctx.getState();
        const cards = currentState.cards // hightlightCard(currentState.cards, this.payload.cardId);
        return ctx.patchState({ cards });
    }
}

export class RestartAction implements ActionType<SortBoardStateModel, never> {
    type = 'RESTART_SESSION';

    async execute(ctx: StateContextType<SortBoardStateModel>) {
        // Set old session to state: Stopped and start a new session;
        await ctx.dispatch(new RestoreStateAction());
        const stoppedState = await ctx.patchState({
            state: State.stopped
        });
        await persist(stoppedState, ctx);
        return ctx.setState(initialState);
    }
}

export class CardOutContainerAction implements ActionType<SortBoardStateModel, { cardId: string }> {
    type = 'CARD_OUT_CONTAINER';

    constructor(public payload: { cardId: string }) { };

    async execute(ctx: StateContextType<SortBoardStateModel>) {
        const cardId = this.payload.cardId;
        const currentState = ctx.getState();
        const cards = currentState.cards.map(card => {
            if (card.id === cardId) {
                return currentState.state === State.order ?
                    { ...card, keuzeId: null } :
                    { ...card, sortKey: null }
            }
            return card;
        });
        const patchedState = await ctx.patchState({ cards, done: isDone(cards, currentState.state), });
        persist(patchedState, ctx);
        return patchedState;
    }
}

export class CardInContainerAction implements ActionType<SortBoardStateModel, { cardId: string, containerId: string, containerText?: string }> {
    type = 'CARD_IN_CONTAINER';

    constructor(public payload: { cardId: string, containerId: string, containerText?: string }) { };

    async execute(ctx: StateContextType<SortBoardStateModel>) {
        const cardId = this.payload.cardId;
        const currentState = ctx.getState();

        const cards = currentState.cards.map(card => {
            if (card.id === cardId) {
                return currentState.state === State.order ?
                    { ...card, keuzeId: this.payload.containerId } :
                    { ...card, sortKey: this.payload.containerId }
            }
            return card;

        })
        const patchedState = await ctx.patchState({ cards, done: isDone(cards, currentState.state) });
        persist(patchedState, ctx);
        return patchedState;
    }
}

const isDone = (cards: { keuzeId?, sortKey?}[], state: State) => {
    return !cards.find(c => {
        if (state === State.order) {
            return !isDefined(c.keuzeId)
        } else {
            return !c.sortKey
        }
    });
}

const persist = (state: SortBoardStateModel, ctx: StateContextType<SortBoardStateModel>) => {
    const stateToStore = {
        activity: state.activity,
        cards: state.cards.map(({ id, keuzeId, sortKey, position }) => {
            keuzeId = keuzeId ?? null;
            sortKey = sortKey ?? null;
            position = position ?? null;
            return { id, keuzeId, sortKey, position };
        }),
        userInfo: state.userInfo,
        state: state.state
    } as StateToStore;
    ctx.storeCustomState(stateToStore);
}

export const store = createStore<SortBoardStateModel>(initialState, !environment.production, {
    addUserId: true,
    collectionName: `${DATABASE.STUDENT.STATE.COLLECTION(!environment.production)}`,
    autoStore: false
});
export default store;