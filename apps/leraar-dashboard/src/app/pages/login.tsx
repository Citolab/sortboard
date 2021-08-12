import React from 'react';
import { StyledFirebaseAuth } from 'react-firebaseui';
import firebase from 'firebase/app';
import { SortboardLogo } from '@sortboard/ui';

export function LoginPage() {
  if (firebase.apps.length > 0) {
    const auth = firebase.apps[0].auth();
    const uiConfig = {
      // Popup signin flow rather than redirect flow.
      signInFlow: 'popup',
      // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
      signInSuccessUrl: '/',
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
    };

    return (
      <div
        style={{
          backgroundImage: `linear-gradient( -40deg, #E2FBFF 60%, #E2FBFF 60%, transparent 0%, transparent 60%)`,
        }}
        className="h-screen w-full flex flex-col items-center justify-center bg-white"
      >
        <SortboardLogo className="w-32"></SortboardLogo>

        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      </div>
    );
  }
}

export default LoginPage;
