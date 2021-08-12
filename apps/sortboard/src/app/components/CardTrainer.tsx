import { CardCanvas, DropThree } from '@sortboard/ui';
import React, { useEffect, useRef, useState } from 'react';

export function CardTrainer() {
  const [dropped, setDropped] = useState(false);
  const [cards, setCards] = useState<
    {
      id: string;
      text: string;
      position: { left: number; top: number };
      containerId: string;
      wie: 'Vriend' | 'Kennis' | 'Idool' | 'Onbekende';
    }[]
  >([
    {
      id: 'homepage',
      text: 'Je staat in de supermarkt en je ziet dat de portemonnee van een onbekende valt',
      position: { left: 840 / 2 - 80, top: 60 },
      containerId: null,
      wie: 'Kennis'
    },
  ]);
  return (
      <div className="invisible lg:visible w-canvas h-2/3 mx-auto absolute top-24 left-0 right-0 z-10">
      <CardCanvas
        className="relative w-full h-full flex flex-col justify-end"
        cards={cards}
        cardSelect={handleCardSelect}
        cardMoved={handleCardMoved}
        cardInContainer={handleCardInContainer}
        cardOutContainer={handleCardOutContainer}
      >
        {!dropped && (
          <Hand
            className="absolute animate-bounce"
            style={{
              left: cards[0].position.left + 130,
              top: cards[0].position.top - 10,
              zIndex: 1110,
            }}
          ></Hand>
        )}

          <DropThree
            text={[
              'Je loopt erop af en geeft de portemonnee terug',
              'Je kijkt of iemand anders de portemonnee teruggeeft en doet het anders zelf',
              'Je doet niks',
            ]}
          />
      </CardCanvas>
      </div>
  );
 
  function handleCardSelect(cardId) {
    // setDropped(true)
  }

  function handleCardMoved(cardId, position) {
    setDropped(false);

    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, position } : { ...card }
      )
    );
  }
  function handleCardInContainer(cardId, containerId) {
    setDropped(true);

    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, containerId: containerId } : { ...card }
      )
    );
  }
  function handleCardOutContainer(cardId) {
    setDropped(false);
    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, containerId: null } : { ...card }
      )
    );
  }
}

const Hand = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    width="68.721"
    height="92.577"
    viewBox="0 0 68.721 92.577"
  >
    <g
      id="Group_183"
      data-name="Group 183"
      transform="translate(-541.821 -372.31)"
    >
      <path
        id="Path_57"
        data-name="Path 57"
        d="M12.823,28v7.353m0-7.353V10.353a4.412,4.412,0,1,1,8.823,0M12.823,28A4.412,4.412,0,1,0,4,28v5.882a22.058,22.058,0,0,0,44.116,0V19.176a4.412,4.412,0,1,0-8.823,0M21.646,10.353V26.528m0-16.176V7.412a4.412,4.412,0,1,1,8.823,0v2.941m0,0V26.528m0-16.176a4.412,4.412,0,1,1,8.823,0v8.823m0,0v7.353"
        transform="matrix(0.891, -0.454, 0.454, 0.891, 539.585, 394.171)"
        fill="#fff"
        stroke="#1db6ce"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </g>
  </svg>
);
