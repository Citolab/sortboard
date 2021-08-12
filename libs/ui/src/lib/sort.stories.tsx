import React, { useState } from 'react';
import { CardCanvas } from './CardCanvas';
import { Card, data } from '@sortboard/data';
import { closestCenterByPixel } from './closestToCenter';
import { Drop } from './Drop';
import { Droppable } from './Droppable';

export default { title: 'CardCanvas-sort', component: CardCanvas };

const wyberVorm = [1, 3, 4, 3, 1].map((columnCount, rowIndex) => {
  return Array.from({ length: columnCount }).map((_, columnIndex) => {
    return `${rowIndex + 1}_${columnIndex + 1}`;
  });
});

const initialCards = () =>
  data.map((c) => ({
    ...c,
    position: { top: 460, left: 50 + 270 * Math.round(Math.random() * 2) },
  }));

export const OrderStory = () => {
  const [cards, setCards] = useState<Card[]>(initialCards);

  const [activeCard, setActiveCard] = useState<unknown>(null);

  return (
    <div className="w-canvas h-canvas bg-gray-200">
      <CardCanvas
        collisionDetection={closestCenterByPixel}
        cards={cards.map((c) => ({
          ...c,
          containerId: c.sortKey,
          text: c.stelling,
        }))}
        cardSelect={handleStartMove}
        cardMoved={handleCardMoved}
        cardInContainer={handleCardInContainer}
        cardOutContainer={handleCardOutContainer}
      >
        <div className="w-full flex justify-end">
          {wyberVorm.map((row, horizontalIndex) => (
            <div key={horizontalIndex} className="flex flex-col justify-center">
              {row.map((key) => (
                <Droppable
                  key={key}
                  id={key}
                  disabled={cards.some((c) => c.sortKey === key)}
                >
                  <Drop></Drop>
                </Droppable>
              ))}
            </div>
          ))}
        </div>
      </CardCanvas>
    </div>
  );

  function handleStartMove(cardId) {
    setActiveCard(cards.find((card) => card.id === cardId));
  }
  function handleCardMoved(cardId, position) {
    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, position } : { ...card }
      )
    );
  }
  function handleCardInContainer(cardId, containerId) {
    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, sortKey: containerId } : { ...card }
      )
    );
  }
  function handleCardOutContainer(cardId) {
    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, sortKey: null } : { ...card }
      )
    );
  }
};
