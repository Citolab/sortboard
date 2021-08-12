import React, { useEffect, useState } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  BrowserRouter,
} from 'react-router-dom';

import 'firebase/firestore';
import 'firebase/firebase-functions';
import 'firebase/auth';

import { initStore } from 'rx-firebase-store';

import store, { LoginSuccessAction } from './pages/activity.store';

import firebase from 'firebase/app';
import { environment } from '../environments/environment';
import LoginPage from './pages/login';
import ActivityPage from './pages/activity';
import { useIsMounted } from '@sortboard/data';

function PrivateRoute({ children, ...rest }) {
  const [user, setUser] = useState(null);
  const [loginChecked, setLoginChecked] = useState(false);
  const isMounted = useIsMounted();

  useEffect(() => {
    const sub = firebase.auth().onAuthStateChanged(
      (user) => {
        if (isMounted()) {
          setUser(user);
          setLoginChecked(true);
        }
      },
      (e) => {
        if (isMounted()) {
          setLoginChecked(true);
        }
      }
    );
    return sub;
  }, [isMounted]);

  if (!loginChecked) {
    return <div>Loading</div>
  } else {
    store.dispatch(new LoginSuccessAction({ user }));
    return (
      <Route
        {...rest}
        render={({ location }) =>
          user ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: location },
              }}
            />
          )
        }
      />
    );
  }
}

export function App() {
  const history = useHistory();
  const [init, setInit] = useState(false);
  useEffect(() => {
    if (!firebase.apps.length) {
      const initFirebaseStore = async () => {
        const app = await firebase.initializeApp(environment.firebase);
        initStore(app, 'europe-west1', {
          logAction: false,
          addUserId: false,
          autoStore: false,
        });
        setInit(true);
      };
      initFirebaseStore();
    }
  }, [history]);

  return !init ? (
    <div></div>
  ) : (
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <LoginPage />
        </Route>
        <PrivateRoute path="/">
          <ActivityPage />
        </PrivateRoute>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
