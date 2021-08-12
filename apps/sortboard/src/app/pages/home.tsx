import {
  Button,
  Login,
  OtherUsers,
  SortMoji,
  UserInfo,
  SortboardLogo,
} from '@sortboard/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
// import store from '../sortboard.store';
import loginStore, {
  LoginAction,
  LoginResumeAction,
  LogoutAction,
  RestartAction,
} from './login.store';
import store, {
  EndSortStateAction,
  ResetStateAction,
  SetUserInfoAction,
} from './../sortboard.store';
import { Dialog } from '@headlessui/react';
import { CardTrainer } from '../components/CardTrainer';
import { environment } from '../../environments/environment';
import { State } from '@sortboard/data';

export function Home() {
  const history = useHistory();
  const [state, setState] = useState(loginStore.currentState());
  const [sortState, setSortState] = useState(store.currentState());
  const [introState, setIntroState] = useState<
    'home' | 'extraInfo' | 'otherUsers' | 'resume'
  >('home');
  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef();
  useEffect(() => {
    const loginSub = loginStore.subscribe(setState);
    const sortSub = store.subscribe(setSortState);
    // loginStore.dispatch(new LogoutAction());
    store.dispatch(new ResetStateAction());
    return () => {
      loginSub.unsubscribe();
      sortSub.unsubscribe();
    };
  }, []);

  const renderDialogContent = () => {
    switch (introState) {
      case 'home': {
        return (
          <>
            <Login
              canSkip={!environment.production}
              doLogin={async (code) => {
                if (!code && !environment.production) {
                  await loginStore.dispatch(
                    new LoginAction({ code, withoutCode: true })
                  );
                  setIntroState('extraInfo');
                } else {
                  const newState = await loginStore.dispatch(
                    new LoginAction({ code, withoutCode: false })
                  );
                  if (!newState.loginError) {
                    if (newState.canResume) {
                      setIntroState('resume');
                    } else {
                      setIntroState('extraInfo');
                    }
                  }
                }
              }}
              errorMessage={state.loginError}
              checking={state.checkingCode}
            />
            <Button
              secondary
              className="w-full mt-4"
              onClick={async () => {
                await loginStore.dispatch(
                  new LoginAction({ code: '', withoutCode: true })
                );
                setIntroState('otherUsers');
              }}
            >
              Geen code, maar wil dit wel doen
            </Button>
          </>
        );
      }
      case 'resume': {
        return <div>
          <div>Je was nog niet helemaal klaar. Wat wil doen?</div>
          <div className="flex justify-between">
            <div>
              <Button
                className="w-full mt-4"
                onClick={async () => {
                  await loginStore.dispatch(new LoginResumeAction());
                  const sortState = store.currentState();
                  if (!sortState.userInfo?.gender) {
                    setIntroState('extraInfo');
                  } else if (sortState.state === State.order) {
                    history.push('sort');
                  } else if (sortState.cards.find((c) => !c.sortKey)) {
                    history.push('sort');
                  } else {
                    await store.dispatch(new EndSortStateAction());
                    history.push('result');
                  }

                }}
              >
                Verder gaan
              </Button>
            </div>
            <div>
              <Button
                className="w-full mt-4"
                onClick={async () => {
                  await loginStore.dispatch(new RestartAction());
                  setIntroState('extraInfo');
                }}
              >
                Opnieuw beginnen
              </Button>
            </div>
          </div>
        </div>;
      }
      case 'extraInfo': {
        return (
          <div>
            <UserInfo
              onChanged={(data) => store.dispatch(new SetUserInfoAction(data))}
            ></UserInfo>
            <Button
              disabled={
                !(sortState.userInfo?.gender && sortState.userInfo?.group)
              }
              className="w-full mt-4"
              onClick={() => {
                setIntroState('otherUsers');
              }}
            >
              Zie de andere personen
            </Button>
          </div>
        );
      }
      case 'otherUsers': {
        return (
          <div>
            <OtherUsers></OtherUsers>
            <Button
              className="w-full mt-4"
              onClick={() => {
                history.push('sort');
              }}
            >
              Ik snap het, starten maar
            </Button>
          </div>
        );
      }
    }
  };

  return (
    <>
      <div className="relative bg-primary-light h-full lg:max-w-2xl lg:w-1/2">
        <svg
          className="hidden lg:block absolute right-0 inset-y-0 h-full w-96 text-primary-light transform translate-x-1/2"
          fill="currentColor"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="50,0 100,0 50,100 0,100" />
        </svg>

        <div className="relative pt-6 px-4 lg:px-8">
          <SortboardLogo className="w-24 fixed bottom-4 left-4"></SortboardLogo>
          <div className="hidden md:block md:ml-10 md:pr-4">Citolab</div>

          <main className="mt-6 mx-auto max-w-7xl px-4">
            <div className="header font-bold text-gray-500 -mt-4 mb-4">Citolab</div>
            <div className="sm:text-center lg:text-left">
              <h1 className="text-2xl lg:text-6xl tracking-tight font-extrabold">
                <span className="header text-primary flex">
                  Wat doe jij? <div className="-scale-x-1 transform ml-3"><SortMoji text="🤔" /></div>
                </span>{' '}
              </h1>
              <p className="hidden lg:block mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Wat zou jij doen in deze situatie?
              </p>
              <div className="absolute lg:invisible flex items-center justify-center shadow mx-auto left-0 right-0 mt-12 bg-white p-4 rounded max-w-md ">
              <SortMoji text="🖥️" /><span className="ml-4 text-gray-500">Helaas, je kan niets doen!<br/>Je moet je scherm eerst even wat groter maken.</span>
              </div>
              <div
                style={{ zIndex: 10000 }}
                className="fixed bottom-12 right-12 mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
              >
                <div className="hidden lg:block rounded-lg shadow">
                  <Button
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  >
                    Ga verder
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 mt-20">
        <h1 className="text-6xl text-center font-extrabold">
          <span className="header text-primary flex justify-end pr-14 -mt-2">
            <SortMoji text={`\ud83d\udeb6\ud83d\udc5b\ud83d\uded2\ud83e\udd14`} />
          </span>
        </h1>
      </div>

      <CardTrainer></CardTrainer>

      <Dialog
        initialFocus={cancelButtonRef}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setIntroState('home');
        }}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="min-h-screen px-4 text-center">
          <Dialog.Overlay className="fixed inset-0" />

          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            {renderDialogContent()}
            {/* <button ref={cancelButtonRef} onClick={() => { setIsOpen(false); setIntroState('home') }}>
              Cancel
            </button> */}
          </div>
        </div>
      </Dialog>
    </>
  );
}
