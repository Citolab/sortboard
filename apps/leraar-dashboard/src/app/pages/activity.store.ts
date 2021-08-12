import { Activity, DATABASE, ActivityState, SortBoardStateModel, State, createCode, stringsAreEqual, StateToStore, parseUrl } from '@sortboard/data';
import { environment } from '../../environments/environment';
import firebase from "firebase/app";
import { StateContext, createStore, setStoreContext, ActionType } from 'rx-firebase-store';

export interface ActivityStateModel {
    loading: boolean;
    activity: Activity;
    activities: Activity[];
    user: firebase.User;
    studentStates: StateToStore[];
    creatingActivity: boolean,
}

const initialState: ActivityStateModel = {
    loading: true,
    activity: null,
    activities: [],
    user: null,
    studentStates: [],
    creatingActivity: false
};

const getActivity = async (code: string, ctx: StateContext<ActivityStateModel>) => {
    const doc = await ctx.firestore.doc(DATABASE.ACTIVITY.DOC(code)).get();
    return doc.exists ? (doc.data() as Activity) : null;
}


const checkCode = async (code: string, ctx: StateContext<ActivityStateModel>) => {
    const activity = await getActivity(code, ctx);
    return (activity && activity.state !== ActivityState.done);
}

const createActivity = async (ctx: StateContext<ActivityStateModel>) => {
    let code = createCode(5);
    // create code and make sure there is no other startable activity with the same code
    let exists = await checkCode(code, ctx);
    while (exists) {
        code = createCode(5);
        exists = await checkCode(code, ctx);
    }
    const activity = {
        createdBy: ctx.auth?.currentUser?.uid,
        startedDate: new Date(),
        code,
        state: ActivityState.inprogress,
    } as Activity;
    return activity;
};


const studentWatcher = (userId: string, code: string, ctx: StateContext<ActivityStateModel>) => {
    const studentCollection = ctx.firestore.collection(DATABASE.TEACHER.ACTIVITY.STUDENT.COLLECTION(userId, code));
    const unsubscribe = studentCollection.onSnapshot(
        (data) => {
            const studentStates = data.docs.map((d) => d.data() as SortBoardStateModel);
            return ctx.patchState({ studentStates })
        },
        error => ({ error }),
    );
    return unsubscribe;
}

export class LoginSuccessAction implements ActionType<ActivityStateModel, { user: firebase.User }> {
    type = 'LOGIN_SUCCESS';
    constructor(public payload: { user: firebase.User }) { }

    execute(ctx: StateContext<ActivityStateModel>): Promise<ActivityStateModel> {
        return ctx.patchState({
            user: this.payload.user
        });
    }
}

export class LogoutAction implements ActionType<ActivityStateModel, never> {
    type = 'LOGOUT';
    async execute(ctx: StateContext<ActivityStateModel>): Promise<ActivityStateModel> {
        await ctx.auth.signOut();
        window.location.href = parseUrl(window.location.href).href;
        return ctx.patchState({
            user: null
        });
    }
}

export class StopActivityAction implements ActionType<ActivityStateModel, never> {
    payload: never;
    type = 'FINISH';
    async execute(ctx: StateContext<ActivityStateModel>): Promise<ActivityStateModel> {
        const activity = {
            ...ctx.getState().activity,
            state: ActivityState.done
        };
        const ret = ctx.patchState({ activity });
        await ctx.firestore.doc(DATABASE.ACTIVITY.DOC(activity.code)).set(activity);
        return ret;
    }
}

export class CreateNewActivityAction implements ActionType<ActivityStateModel, never>{
    type = 'CREATE_ACTIVITY';
    async execute(ctx: StateContext<ActivityStateModel>): Promise<ActivityStateModel> {
        const currentState = ctx.getState();
        const newActivity = await createActivity(ctx);
        await ctx.firestore.doc(DATABASE.ACTIVITY.DOC(newActivity.code)).set(newActivity);
        await ctx.setState({
            ...initialState,
            loading: false,
            activity: newActivity,
            activities: [...currentState.activities, newActivity]
        });
        return ctx.dispatch(new SelectActivityAction({ code: newActivity.code }));
    }
}

export class SelectActivityAction implements ActionType<ActivityStateModel, { code: string }> {
    type = 'SELECT_ACTIVITY_ACTION';

    constructor(public payload: { code: string }) { }

    async execute(ctx: StateContext<ActivityStateModel>): Promise<ActivityStateModel> {
        const currentState = ctx.getState();
        const activity = currentState.activities.find(a => stringsAreEqual(a.code, this.payload.code));
        // unsubscribe previous subscription
        const prevUnsubscribe = ctx.getContext('unsubscribe') as () => void;
        let newState = await ctx.patchState({ activity, studentStates: [] })
        if (prevUnsubscribe) { prevUnsubscribe(); }
        if (activity && activity.state !== ActivityState.done) {
            // subscribe for changes.
            const unsubscribe = studentWatcher(ctx.auth.currentUser.uid, activity.code, ctx);
            setStoreContext([{
                name: 'unsubscribe',
                dependency: unsubscribe
            }]);
        } else if (activity && activity.state === ActivityState.done) {
            const studentCollection = await ctx.firestore.collection(DATABASE.TEACHER.ACTIVITY.STUDENT.COLLECTION(ctx.auth.currentUser.uid, activity.code)).get();
            newState = await ctx.patchState({ studentStates: studentCollection.docs.map(d => d.data() as SortBoardStateModel) });
        }
        return newState;
    }
}

export class LoadActivitiesAction implements ActionType<ActivityStateModel, never> {
    type = 'LOAD_ACTIVITIES';

    async execute(ctx: StateContext<ActivityStateModel>): Promise<ActivityStateModel> {
        if (ctx.getState().activities.length === 0) {
            ctx.patchState({ loading: true, creatingActivity: true });
            const userId = ctx.getState().user.uid;
            const activityRefs = await ctx.firestore
                .collection(DATABASE.ACTIVITY.COLLECTION)
                .where('createdBy', '==', userId)
                .orderBy('startedDate', 'desc')
                .get();
            const activities = activityRefs.docs.map(d => d.data() as Activity);
            let firstRunningActivity = activities.find(a => a.state !== ActivityState.done);
            if (activities.length === 0) {
                firstRunningActivity = await createActivity(ctx);
                await ctx.firestore.doc(DATABASE.ACTIVITY.DOC(firstRunningActivity.code)).set(firstRunningActivity);
                activities.push(firstRunningActivity);
            }
            await ctx.patchState({
                loading: false,
                creatingActivity: false,
                activities
            });
            return await ctx.dispatch(new SelectActivityAction({ code: firstRunningActivity ? firstRunningActivity.code : activities[0].code }))
        }
    }
}



const store = createStore<ActivityStateModel>(initialState, !environment.production);
export default store;