import React, { useEffect, useState } from 'react';
import { DropThree } from './DropThree';
import { CardCanvas } from './CardCanvas';
import { Card, data, isDefined } from '@sortboard/data';
import { rectIntersection } from '@dnd-kit/core';

export default { title: 'CardCanvas-order', component: CardCanvas };

const initialCards = () =>
  data.map((c) => ({
    ...c,
    position: { top: 200, left: 800 / 2 - 80 },
  }));

export const OrderStory = () => {
  const [cards, setCards] = useState<Card[]>(initialCards);

  const [activeCard, setActiveCard] = useState<Card>(null);

  return (
    <div className="w-canvas h-canvas bg-gray-200">
      <CardCanvas
        autoSelectNextCard={true}
        collisionDetection={rectIntersection}
        cards={cards.map((c) => ({
          ...c,
          containerId: c.keuzeId,
          text: c.stelling,
        }))}
        cardSelect={handleCardSelect}
        cardMoved={handleCardMoved}
        cardInContainer={handleCardInContainer}
        cardOutContainer={handleCardOutContainer}
      >
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex items-center justify-center">
            _{activeCard?.emojiStory}_
          </div>
          <DropThree
            text={
              activeCard ? activeCard.keuzes.map((k) => k.text) : ['', '', '']
            }
          />
        </div>
      </CardCanvas>
    </div>
  );

  function handleCardSelect(cardId) {
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
        card.id === cardId ? { ...card, keuzeId: containerId } : { ...card }
      )
    );
  }
  function handleCardOutContainer(cardId) {
    setCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, keuzeId: null } : { ...card }
      )
    );
  }
};
