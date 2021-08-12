import { rectIntersection } from '@dnd-kit/core';
import { Card, data, State } from '@sortboard/data';
import {
  Button,
  CardCanvas,
  closestCenterByPixel,
  // rectIntersection,
  DropThree,
  Drop,
  Droppable,
  DropWyber,
  wyberVorm,
  SortMoji,
} from '@sortboard/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { useHistory } from 'react-router-dom';
import { CardScreen } from '../components/CardScreen';
import { ReactComponent as FullscreenIcon } from '../../assets/fullscreen.svg';
import { motion } from 'framer-motion';

import store, {
  CardInContainerAction,
  CardMovedAction,
  CardOutContainerAction,
  EndSortStateAction,
  ToSortStateAction,
} from '../sortboard.store';

export function WyberHeader() {
  return (
    <div className="absolute w-full flex justify-between">
      <div className="header text-primary tracking-tight font-extrabold text-lg flex">
        <span role="img" aria-label="neutral" className="text-sm">
          <SortMoji text="❤️" />
        </span>
        <span className="ml-2">
          ik voel <u>niet zo mee</u> met de ander
        </span>
      </div>
      <div className="header text-primary tracking-tight font-extrabold text-lg flex">
        <span className="mr-2">ik voel <u>mee</u> met de ander</span>
        <span role="img" aria-label="neutral" className="text-4xl">
          <SortMoji text="❤️" />
        </span>
      </div>
    </div>
  );
}

export function SortBoard(props) {
  const [state, setState] = useState(store.currentState());
  const [fullScreen, setFullScreen] = useState(false);

  const history = useHistory();
  useEffect(() => {
    const subs = store.subscribe(setState);
    return () => subs.unsubscribe();
  }, []);

  // PK: use active card to set the dropzone text
  const [activeCard, setActiveCard] = useState<Card>(null);
  const fullScreenSort = useFullScreenHandle();

  const reportChange = useCallback(
    (state, handle) => {
      const fullScreen = handle === fullScreenSort;
      setFullScreen(state);
    },
    [fullScreenSort]
  );

  if (state.loading) {
    return <div>Loading...</div>;
  }
  if (state.state === State.done) {
    history.push('/result');
  }
  return (
    <>
      {!fullScreen && (
        <motion.button
          animate={{
            width: ['10rem', '2.25rem'],
            color: ['#000000', '#eeeeee'],
          }}
          whileHover={{
            width: '10rem',
            color: ['#000000','#000000'],
            transition: { ease: 'easeOut', duration: 0.2 },
          }}
          transition={{ delay: 3, loop: 0, ease: 'easeOut' }}
          className="fixed left-2 top-2 w-9 h-9 p-1 bg-white shadow rounded overflow-hidden flex items-center justify-start"
          onClick={fullScreenSort.enter}
        >
          <FullscreenIcon
            className={`text-gray-600 fill-current`}
            style={{ minWidth: '1.6rem', width: '1.6rem' }}
          ></FullscreenIcon>
          <span className="ml-2 whitespace-nowrap">Volledig scherm</span>
        </motion.button>
      )}

      <FullScreen
        className="h-full"
        handle={fullScreenSort}
        onChange={reportChange}
      >
        <CardScreen>
          {fullScreen && (
            <button
              className="fixed left-2 top-2"
              onClick={fullScreenSort.exit}
            >
              <FullscreenIcon className="w-10 h-10 z-0 bg-white shadow p-2 rounded"></FullscreenIcon>
            </button>
          )}
          <CardCanvas
            className="w-canvas h-canvas relative"
            autoSelectNextCard={state.state === State.order}
            collisionDetection={
              state.state === State.order
                ? rectIntersection
                : closestCenterByPixel
            }
            cards={state.cards.map((c) => ({
              ...c,
              containerId: state.state === State.order ? c.keuzeId : c.sortKey,
              text: c.stelling,
            }))}
            cardSelect={handleCardStartMove}
            cardMoved={handleCardMoved}
            cardInContainer={handleCardInContainer}
            cardOutContainer={handleCardOutContainer}
          >
            {state.state === State.order && (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="h-1/3 flex justify-center text-6xl">
                  <SortMoji text={activeCard?.emojiStory} />
                </div>

                <div className="h-1/3 flex items-end justify-center">
                  {state.done ? (
                    <Button
                      className="w-auto"
                      onClick={() => store.dispatch(new ToSortStateAction())}
                    >
                      Naar sorteren
                    </Button>
                  ) : (
                    <span className="header text-primary tracking-tight font-extrabold text-xl">
                      Wat doe jij?
                    </span>
                  )}
                </div>

                <DropThree
                  text={
                    activeCard
                      ? activeCard.keuzes.map((k) => k.text)
                      : ['', '', '']
                  }
                />
              </div>
            )}
            {state.state === State.sort && (
              <div className="w-full h-full flex flex-col justify-start">
                <WyberHeader></WyberHeader>
                <div className="w-full flex justify-end">
                  {wyberVorm.map((row, horizontalIndex) => (
                    <div
                      key={horizontalIndex}
                      className="flex flex-col justify-center"
                    >
                      {row.map((key) => (
                        <Droppable
                          id={key}
                          key={key}
                          disabled={state.cards.some((c) => c.sortKey === key)}
                        >
                          {/* _{state.cards.find((c) => c.sortKey === key)?.sortKey}_ */}
                        </Droppable>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex pt-2 justify-center">
                  {state.done ? (
                    <Button
                      className="w-auto"
                      onClick={() => {
                        store.dispatch(new EndSortStateAction());
                        history.push('/result');
                      }}
                    >
                      Helemaal klaar, toon het resultaat
                    </Button>
                  ) : (
                    <span className="header text-primary tracking-tight font-extrabold text-md text-center">
                      Sorteer de kaartjes van links naar rechts op hoeveel je met de ander meevoelt.<br />
	                    In elk vak komt een kaartje. Bovenin of onderin maakt niet uit.
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardCanvas>
        </CardScreen>
      </FullScreen>
    </>
  );

  function handleCardStartMove(cardId) {
    setActiveCard(state.cards.find((card) => card.id === cardId));
  }

  function handleCardMoved(cardId, position) {
    store.dispatch(new CardMovedAction({ cardId, position }));
  }

  function handleCardInContainer(cardId, containerId) {
    store.dispatch(
      new CardInContainerAction({
        cardId,
        containerId,
      })
    );
  }
  function handleCardOutContainer(cardId) {
    store.dispatch(new CardOutContainerAction({ cardId }));
  }
}
