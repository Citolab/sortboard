import React, { useEffect, useState, useRef } from 'react';
import { SortBoard } from './pages/sortboard';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { Home } from './pages/home';
import { Result } from './pages/result';
import { initStore, setStoreContext } from 'rx-firebase-store';
import { environment } from '../environments/environment';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/firebase-functions';
import 'firebase/auth';
import { DATABASE, getUserInfo } from '@sortboard/data';
import loginStore, {
  AutoLoginFailAction,
  LoginSuccessAction,
} from './pages/login.store';
import store, { RestoreStateAction } from './sortboard.store';

export default function App() {
  const mounted = useRef(true);
  const history = useHistory();
  const [loginState, setLoginState] = useState(loginStore.currentState());
  const [state, setState] = useState(store.currentState());
  useEffect(() => {
    // mounted variable because of: https://stackoverflow.com/a/60907638/6729295
    let loginSubs: { unsubscribe: () => void };
    let subs: { unsubscribe: () => void };
    if (mounted.current) {
      loginSubs = loginStore.subscribe(setLoginState);
      subs = store.subscribe(setState);
    }
    return () => {
      mounted.current = false;
      if (subs) subs.unsubscribe();
      if (loginSubs) loginSubs.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setStoreContext([{ name: 'history', dependency: history }]);
  }, [history]);

  function PrivateRoute({ children, ...rest }) {
    // const userState = loginStore.currentState();
    if (!loginState.user || !state.activity) {
      return <div>Loading...</div>;
    } else {
      return (
        <Route
          {...rest}
          render={({ location }) =>
            loginState.user ? (
              children
            ) : (
              <Redirect
                to={{
                  pathname: '/',
                  state: { from: location },
                }}
              />
            )
          }
        />
      );
    }
  }

  useEffect(() => {
    const authWatcher = (auth: firebase.auth.Auth) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          getUserInfo(user).then((userInfo) => {
            loginStore
              .dispatch(new LoginSuccessAction({ userInfo }))
              .then((_) => {
                store.dispatch(new RestoreStateAction());
              });
          });
        } else {
          loginStore.dispatch(new AutoLoginFailAction());
        }
      });
    };

    const initFirebaseStore = async () => {
      const app = await firebase.initializeApp(
        environment.firebase,
        'database'
      );
      initStore(app, 'europe-west1', {
        collectionName: () => {
          const collectionName = `${DATABASE.STUDENT.ACTION.COLLECTION(
            !environment.production,
            app.auth()?.currentUser?.uid
          )}`;
          return collectionName;
        },
        addUserId: true,
        autoStore: true,
      });
      // start watching auth changes.
      authWatcher(app.auth());
    };
    initFirebaseStore();
  }, []);

  return loginState.loading ? (
    <div>Loading</div>
  ) : (
    <Switch>
      <Route path="/sort">
        <SortBoard />
      </Route>
      {/* <PrivateRoute path="/sort">
        <SortBoard />
      </PrivateRoute> */}
      <PrivateRoute path="/result">
        <Result />
      </PrivateRoute>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  );
}
