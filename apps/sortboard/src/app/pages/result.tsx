import {
  Button,
  Drop,
  wyberVorm,
  Card,
  SortMoji,
  OtherUsers,
  Tab,
} from '@sortboard/ui';
import React, { useEffect, useState } from 'react';
import { CardScreen } from '../components/CardScreen';
import store from '../sortboard.store';
import { useTrail, a } from '@react-spring/web';
import { WyberHeader } from './sortboard';
import { Link, useHistory } from 'react-router-dom';

export function Result() {
  const [state, setState] = useState(store.currentState());
  const [report, setReport] = useState(0);
  const history = useHistory();

  useEffect(() => {
    const subs = store.subscribe(setState);
    return () => subs.unsubscribe();
  }, []);

  return (
    <CardScreen>
              <div className="flex mt-2 justify-center my-6">
        </div>
      <div className="w-canvas h-canvas relative">
        <WyberHeader></WyberHeader>
        <div className="w-full flex">
          {wyberVorm.map((row, horizontalIndex) => (
            <div key={horizontalIndex} className="flex flex-col justify-center">
              {row.map((key) => (
                <Drop key={key}></Drop>
              ))}
            </div>
          ))}
        </div>

        {state.cards.map((card, index) => (
          <Card
            key={index}
            style={{
              left: card.position.left,
              top: card.position.top,
              position: 'absolute',
            }}
            id={`card${index}`}
            wie={report === 0 ? card.wie : null}
          >
            {report === 1 && (
              <div className="absolute text-3xl transform right-0 bottom-0">
                {card.keuzeId === '2' && <SortMoji text="🤷" />}
              </div>
            )}
            {report === 2 && (
              <div className="absolute text-3xl transform right-0 bottom-0">
                {card.waar === 'online' && <SortMoji text="📱" />}
              </div>
            )}
            {card.stelling}
          </Card>
        ))}

        {/* <pre>{JSON.stringify(state.cards, null, 4)}</pre> */}
        <div className="flex items-center justify-center">
          <Tab selected={report !== 0} className="mr-4" onClick={() => setReport(0)}>
            Wie is de ander?
          </Tab>
          <Tab selected={report !== 1} className="mx-4" onClick={() => setReport(1)}>
            Waar deed je niets?
          </Tab>
          <Tab selected={report !== 2} className="ml-4" onClick={() => setReport(2)}>
            Online handelen?
          </Tab>
        </div>
      </div>

      <Button
        className="fixed top-2 right-2"
        onClick={() => {
          history.push('/');
        }}
      >
        Opnieuw
      </Button>
    </CardScreen>
  );
}

// const Trail: React.FC<{ open: boolean }> = ({ open, children }) => {
//   const items = React.Children.toArray(children);
//   const trail = useTrail(items.length, {
//     config: { mass: 5, tension: 2000, friction: 200 },
//     opacity: open ? 1 : 0,
//     x: open ? 0 : 20,
//     height: open ? 110 : 0,
//     from: { opacity: 0, x: 20, height: 0 },
//   });
//   return (
//     <>
//       {trail.map(({ height, ...style }, index) => (
//         <a.div key={index} style={style}>
//           {items[index]}
//         </a.div>
//       ))}
//     </>
//   );
// };
