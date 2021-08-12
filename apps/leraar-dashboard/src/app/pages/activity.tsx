import {
  data,
  flatten,
  getUnique,
  getCardDistributions,
  State,
  ActivityState,
  sort,
} from '@sortboard/data';
import {
  Button,
  Card,
  CardBadge,
  Drop,
  Dropdown,
  OtherUsers,
  SortboardLogo,
  Tab,
} from '@sortboard/ui';
import React, { useEffect, useState } from 'react';

import store, {
  CreateNewActivityAction,
  LoadActivitiesAction,
  LogoutAction,
  StopActivityAction,
  SelectActivityAction,
} from './activity.store';
import moment from 'moment';
import 'moment/locale/nl';
enum ReportType {
  reageren,
  meevoelen,
}

export function ActivityPage() {
  const [state, setState] = useState(store.currentState());
  const [report, setReport] = useState(ReportType.reageren);
  useEffect(() => {
    const subs = store.subscribe((state) => {
      setState(state);
    });
    store.dispatch(new LoadActivitiesAction());
    return () => subs.unsubscribe();
  }, []);

  if (state.loading) {
    return <div>Loading</div>;
  }

  const getWieSortKey = (wie: 'Vriend' | 'Kennis' | 'Idool' | 'Onbekende') => {
    switch (wie) {
      case 'Vriend':
        return 0;
      case 'Kennis':
        return 1;
      case 'Idool':
        return 2;
      case 'Onbekende':
        return 3;
    }
  };

  const draggedCards = sort(
    flatten(
      state.studentStates
        .filter((studentState) => {
          if (state.activity.state === ActivityState.inprogress) {
            // filter just the ones that were stopped half way.
            return studentState.state !== State.stopped;
          } else {
            // only sessions that are completed.
            return studentState.state === State.done;
          }
        })
        .map((state) => state.cards)
    ).map((card) => {
      const cardDefinition = data.find((d) => d.id === card.id);
      return {
        ...cardDefinition,
        keuzeId: card.keuzeId,
        sortKey: card.sortKey,
        position: card.position,
        sorting: getWieSortKey(cardDefinition.wie),
      };
    }),
    (card) => card.sorting
  );

  const minCards = draggedCards.filter((d) => d.sortKey === '1_1');
  const maxCards = draggedCards.filter((d) => d.sortKey === '5_1');

  const uniqueMinCardsWithCounts = getUnique(minCards.map((c) => c.id)).map(
    (uniqueCardId) => {
      const card = data.find((d) => d.id === uniqueCardId);
      return {
        ...card,
        count: minCards.filter((c) => c.id === uniqueCardId).length,
      };
    }
  );
  const uniqueMaxCardsWithCounts = getUnique(maxCards.map((c) => c.id)).map(
    (uniqueCardId) => {
      const card = data.find((d) => d.id === uniqueCardId);
      return {
        ...card,
        count: maxCards.filter((c) => c.id === uniqueCardId).length,
      };
    }
  );

  const renderReportContent = () => {
    switch (report) {
      case ReportType.reageren: {
        return (
          <div>
            {getCardDistributions(draggedCards, true).map((card) => {
              return (
                <div key={card.id} className="flex mb-8">
                  <div className="relative mx-3 p-px">
                    <Card
                      id={card.id}
                      isActive={true}
                      inContainer={false}
                      wie={card.wie}
                      className="relative m-px"
                    >
                      {card.stelling}
                    </Card>
                  </div>

                  {card.keuzes.map((keuze) => (
                    <div key={keuze.id} className="mx-3 relative">
                      <Drop
                        style={{
                          backgroundImage: `linear-gradient( 0deg, #E2FBFF ${keuze.scaled}%, #E2FBFF ${keuze.scaled}%, white 0%, white ${keuze.scaled}%)`,
                        }}
                      >
                        {keuze.text}
                      </Drop>
                      <div className="-top-4 -right-4 z-100 absolute">
                        <CardBadge>
                          {keuze.scaled}
                          <span className="text-xs">%</span>
                        </CardBadge>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      }

      case ReportType.meevoelen: {
        return (
          <div className="flex">
            <div className="m-5">
              <div className="header text-primary flex">
                Ik voelde&nbsp;<span className="font-bold">het minst</span>
                &nbsp; mee met de ander
              </div>
              <p className="text-gray-500 text-sm flex"></p>
              <div className="flex flex-wrap">
                {uniqueMinCardsWithCounts.map((card) => {
                  return (
                    <div key={card.id} className="m-2 mr-3 relative">
                      <Card
                        wie={card.wie}
                        id={card.id}
                        isActive={true}
                        inContainer={false}
                      >
                        {card.stelling}
                      </Card>
                      <div className="z-100 -top-3 -right-3 absolute text-3xl">
                        <CardBadge>{card.count}</CardBadge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="m-5">
              <div className="header text-primary flex">
                Ik voelde&nbsp;<span className="font-bold">het meest</span>
                &nbsp;mee met de ander
              </div>
              <div className="flex flex-wrap">
                {uniqueMaxCardsWithCounts.map((card) => {
                  return (
                    <div key={card.id} className="m-2 mr-3 relative">
                      <Card
                        wie={card.wie}
                        id={card.id}
                        isActive={true}
                        inContainer={false}
                      >
                        {card.stelling}
                      </Card>
                      <div
                        style={{ top: '-2rem', right: '-2rem', zIndex: 100 }}
                        className="absolute text-3xl"
                      >
                        <CardBadge>{card.count}</CardBadge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
    }
  };
  if (!state.activity) {
    return <div>Loading...</div>;
  }
  return (
    <div
      className="w-full h-screen flex flex-col"
      style={
        {
          // background: `rgb(226 251 255)`,
          // backgroundImage: `linear-gradient( 0deg, #ffffff 60%, #ffffff 60%, #E2FBFF 0%, #E2FBFF 60%)`,
        }
      }
    >
      <div className="absolute top-5 right-2 d-flex">
        {/* <Dropdown
          onSelect={(code) => {
            store.dispatch(new SelectActivityAction({ code }));
          }}
          text={state.activity?.code ?? 'Activiteiten'}
          items={[
            ...state.activities.map((a) => {
              const startDate = (a.startedDate as any).toDate
                ? (a.startedDate as any).toDate()
                : a.startedDate;
              return {
                id: a.code,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: `${a.code} - ${moment(startDate)
                  .locale('nl')
                  .format('DD MMMM')}`,
              };
            }),
          ]}
        ></Dropdown> */}

        <Button className="ml-2" secondary onClick={() => store.dispatch(new LogoutAction())}>
          Uitloggen
        </Button>
      </div>

      <SortboardLogo className="w-32 absolute top-2 left-2"></SortboardLogo>
      <div className="fixed top-5 right-3"></div>
      <div className="bg-primary-light">
        <div className="flex flex-col items-center justify-center mt-6 text-center ">
          {state.activity.state === ActivityState.done && (
            <Button
              onClick={() => store.dispatch(new CreateNewActivityAction())}
            >
              Start watdoejij
            </Button>
          )}
          {state.activity.state !== ActivityState.done && (
            <h1 className="text-5xl header font-bold text-primary-dark tracking-widest flex items-center">
              {state.activity?.code}

              <svg
                className="animate-spin ml-2 h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {state.activity.state === ActivityState.inprogress && (
                <Button
                  className="ml-4"
                  onClick={() => store.dispatch(new StopActivityAction())}
                >
                  Stop
                </Button>
              )}
            </h1>
          )}
          <div>
            {/* {state.activity?.state !== ActivityState.done ? (
              <button
                className="ml-8"
                onClick={() => store.dispatch(new StopActivityAction())}
              >
                <RefreshIcon
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />
              </button>
            ) : null} */}
          </div>
        </div>
        <div className="flex items-center flex-col justify-center my-6">
          {state.activity.state === ActivityState.inprogress && (
            <div>
              gestarte leerlingen:{' '}
              <span className="header font-bold text-primary text-2xl">
                {
                  state.studentStates.filter((s) => s.state !== State.stopped)
                    .length
                }
              </span>
            </div>
          )}
          <div>
            leerlingen afgerond:{' '}
            {/* {state.activity.state === ActivityState.inprogress ? '' : ''}: */}
            <span className="header font-bold text-primary text-2xl">
              {state.studentStates.filter((s) => s.state === State.done).length}
            </span>
          </div>
          <div className="flex mt-2">
            <OtherUsers condensed={true}></OtherUsers>
          </div>
          {/* <div>
                Status:{' '}
                {state.activity?.state === ActivityState.inprogress
                  ? 'bezig (leerlingen kunnen nog inloggen met deze startcode)'
                  : 'afgerond'}
              </div> */}
        </div>
      </div>

      <div className="flex items-center justify-center w-full mt-3">
        {/* <Button
          secondary={report !== ReportType.activity}
          onClick={() => setReport(ReportType.activity)}
        >
          Activiteit
        </Button> */}
        <Tab
          selected={report !== ReportType.reageren}
          onClick={() => setReport(ReportType.reageren)}
          className="mr-4"
        >
          Hoe reageert de klas?
        </Tab>
        <Tab
          selected={report !== ReportType.meevoelen}
          onClick={() => setReport(ReportType.meevoelen)}
          className="ml-4"
        >
          Hoe voelen ze mee?
        </Tab>
      </div>

      <div className="w-full flex justify-center mt-16">
        {renderReportContent()}
      </div>
    </div>
  );
}

export default ActivityPage;
