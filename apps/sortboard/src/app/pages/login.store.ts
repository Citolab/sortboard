import { setUserInfo, UserInfo, Activity, ActivityState, DEMO_CODE, DATABASE, SortBoardStateModel, State } from '@sortboard/data';
import { environment } from '../../environments/environment';
import firebase from "firebase/app";
import sortStore, { SetInitialStateAction, RestartAction as RestartSortAction, RestoreStateAction } from './../sortboard.store';
import { StateContext, createStore, ActionType } from 'rx-firebase-store';

export interface LoginStateModel {
    code: string;
    user: UserInfo;
    loginError: string;
    loading: boolean;
    checkingCode: boolean;
    canLogin: boolean;
    canResume: boolean;
}

const initialState: LoginStateModel =
{
    code: '',
    user: null,
    loginError: '',
    loading: true,
    checkingCode: false,
    canLogin: false,
    canResume: false
};


export class LoginSuccessAction implements ActionType<LoginStateModel, { userInfo: UserInfo }> {
    type = 'LOGIN_SUCCESS'

    constructor(public payload: { userInfo: UserInfo }) { }

    async execute(ctx: StateContext<LoginStateModel>): Promise<LoginStateModel> {
        return ctx.patchState({
            code: '',
            loading: false,
            user: this.payload.userInfo
        });
    }
}

export class AutoLoginFailAction implements ActionType<LoginStateModel, never> {
    type = 'AUTO_LOGIN_SUCCESS';

    execute(ctx: StateContext<LoginStateModel>): Promise<LoginStateModel> {
        return ctx.patchState({
            code: '',
            loading: false,
            user: null
        });
    }
}

export class LogoutAction implements ActionType<LoginStateModel, never> {
    type = 'LOGOUT';

    async execute(ctx: StateContext<LoginStateModel>): Promise<LoginStateModel> {
        await ctx.auth?.signOut();
        return ctx.patchState({
            code: '',
            loading: false,
            user: null
        })
    }
}

export class LoginResumeAction implements ActionType<LoginStateModel, never> {
    type = 'RESUME';

    async execute(ctx: StateContext<LoginStateModel>): Promise<LoginStateModel> {
        const sortState = await sortStore.dispatch(new RestoreStateAction());
        return ctx.patchState({
            canResume: false,
            user: {
                demoUser: false,
                activityCode: sortState.activity?.code,
                avatarIndex: 0,
                teacherId: sortState.activity?.createdBy,
                token: await ctx.auth.currentUser.getIdToken(),
                id: ctx.auth.currentUser.uid
            }
        })
    }
}

export class RestartAction implements ActionType<LoginStateModel, never> {
    type = 'RESTART';

    async execute(ctx: StateContext<LoginStateModel>): Promise<LoginStateModel> {
        const currentState = ctx.getState();
        await sortStore.dispatch(new RestartSortAction());
        await ctx.auth?.signOut();
        return ctx.dispatch(new LoginAction({ code: currentState.code, withoutCode: false }));
    }
}

export class LoginAction implements ActionType<LoginStateModel, { code: string, withoutCode: boolean }> {
    type = 'LOGIN';
    constructor(public payload: { code: string, withoutCode: boolean }) { }

    async execute(ctx: StateContext<LoginStateModel>): Promise<LoginStateModel> {

        let { code } = this.payload;
        code = code.toUpperCase().trim();
        await ctx.auth.signInAnonymously();
        ctx.patchState({
            code,
            checkingCode: true,
            user: null,
            loginError: ''
        });
        if (ctx.auth.currentUser && !this.payload.withoutCode) {// && ctx.auth.currentUser.displayName
            const prevState = (await ctx.firestore.doc(
                DATABASE.STUDENT.STATE.DOC(!environment.production, ctx.auth.currentUser.uid)).get())
                .data() as SortBoardStateModel;
            if (prevState && prevState.activity?.code !== DEMO_CODE && prevState.activity?.code === this.payload.code && (prevState.state !== State.done && prevState.state !== State.stopped)) {
                return ctx.patchState({ canResume: true });
            } else if (prevState) {
                // logout first otherwise you could get the same id for a different user on the same device.
                await ctx.auth.signOut();
            }
        }
        else if (this.payload.withoutCode) {
            // logout first otherwise you could get the same id for a different user on the same device.
            await ctx.auth.signOut();
        }
        // sign-in before the code is checked because then the uid can be used to setup things
        // in the checkCode function.
        let user: firebase.User;
        try {
            user = (await ctx.auth.signInAnonymously()).user;
        } catch {
            console.error('cannot login');
        }
        //const code = action.payload;
        const checkCode = async () => {
            if (!this.payload.withoutCode) {
                return ((await ctx.functions.httpsCallable('checkCode')({ userId: ctx.auth.currentUser.uid, code }))?.data) as { activity: Activity, avatarIndex: number };
            } else {
                const fakeResult = {
                    activity: {
                        code: DEMO_CODE,
                        createdBy: user.uid,
                        startedDate: new Date(),
                        state: ActivityState.inprogress
                    }, avatarIndex: 0
                } as { activity: Activity, avatarIndex: number };
                return await sortStore.dispatch(new SetInitialStateAction({ activity: fakeResult.activity, user: null }));
            }
        }
        let activity: Activity;
        const loginCode = code ?? DEMO_CODE;
        try {
            const result = await checkCode();
            if (result.activity) {
                activity = result.activity;
            } else {
                return ctx.patchState({
                    code: loginCode,
                    loading: false,
                    checkingCode: false,
                    user: null,
                    loginError: 'Onbekende code'
                });
            }
        } catch (error) {
            return ctx.patchState({
                code: loginCode,
                loading: false,
                checkingCode: false,
                user: null,
                loginError: 'Onbekende code'
            });
        }
        if (activity) {
            if (user) {
                // TODO: check state to restore.
                const userInfo = await setUserInfo(user, loginCode, activity.createdBy, loginCode === DEMO_CODE);
                const newState = await ctx.dispatch(new LoginSuccessAction({ userInfo }));
                await sortStore.dispatch(new SetInitialStateAction({ activity, user: userInfo }));
                ctx.patchState({ checkingCode: false });
                return newState;
            }
        }
    }
}

const store = createStore<LoginStateModel>(initialState, !environment.production, { addUserId: false, autoStore: false, logAction: false });

export default store;