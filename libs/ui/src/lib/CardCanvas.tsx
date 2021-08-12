import React, { useEffect, useRef, useState } from 'react';
import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  LayoutMeasuringStrategy,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  Translate,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Draggable } from './Draggable';
import { Card } from './Card';
import { isDefined } from '@sortboard/data';
export interface SortCard {
  id: string;
  text: string;
  containerId?: string;
  position?: { top: number; left: number };
  zIndex?: number;
  wie?: 'Vriend' | 'Kennis' | 'Idool' | 'Onbekende';
}
interface Props {
  cards: SortCard[];
  cardInContainer?: (cardId: string, containerId: string) => void;
  cardOutContainer?: (cardId: string) => void;
  cardMoved?: (cardId: string, position: { top: number; left: number }) => void;
  cardSelect?: (cardId: string) => void;
  children?: React.ReactNode;
  className?: string;
  collisionDetection?: CollisionDetection;
  autoSelectNextCard?: boolean;
}

export function CardCanvas(props: Props) {
  const constraintsRef = useRef(null);
  const cardRefs = useRef<{ initialTranslate: Translate; id: string }[]>([]);

  // PK: Our own internal set, almost the same, just added zIndex
  const [cards, setCards] = useState<SortCard[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);

  const sensors = useSensors(mouseSensor, touchSensor);

  const firstCards = useRef(true);
  // PK:merge properties, just to use zIndex here

  useEffect(() => {
    setCards(() =>
      cards.length === 0
        ? props.cards.map((c, i) => ({ ...c, zIndex: i })) // fill cards from props.cards and add zIndex
        : reOrderCards(
            cards.map(
              (c, i) => ({ ...c, ...props.cards[i] }) // merge cards with props.cards);
            ),
            activeCard?.id
          )
    );
  }, [props.cards]);

  // PK: Just to show the first card as active, the eslint ignores.. I just don't know how to fix those
  // PK: Do not attempt this to do this in the previouse useEffect, cause the cards will not be set in the useEffect, only after
  const cardPrevious = usePrevious(cards);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Object is possibly 'null'
    if (isDefined(cardPrevious) && cardPrevious.length === 0) {
      const undraggedCards = props.cards.filter(
        (c) => !isDefined(c.containerId)
      );
      handleDragStart({
        active:
          undraggedCards.length > 0
            ? { id: undraggedCards[undraggedCards.length - 1].id }
            : '',
      });
    }
  }, [cards]);

  const dropAnimation = {
    duration: 500,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  };

  // PK: keep a ref to the active card, cause of the DragOverlay
  const [activeCard, setActiveCard] = useState<SortCard>();

  return (
    <div ref={constraintsRef} className={`${props.className}`}>
      <DndContext
        layoutMeasuring={{ strategy: LayoutMeasuringStrategy.Always }}
        collisionDetection={
          props.collisionDetection ? props.collisionDetection : rectIntersection
        }
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        {cards.map((card, index) => {
          return (
            <Draggable
              key={index}
              id={card.id}
              position={card.position}
              zIndex={card.zIndex}
              isActive={card.id === activeCard?.id}
              inContainer={isDefined(card.containerId)}
              wie={card.wie}
            >
              {card.text}
            </Draggable>
          );
        })}

        <DragOverlay>
          {isDragging ? (
            <Card id="overlay" isActive={true} wie={activeCard?.wie}>
              {activeCard?.text}
            </Card>
          ) : null}
        </DragOverlay>
        {props.children}
      </DndContext>
    </div>
  );

  function handleDragStart(event) {
    setIsDragging(true);

    // PK: remove from this container, so that you can drop it directly in this container
    // PK: (enables the otherwise disabled container, this was a bug..)
    props.cardOutContainer && props.cardOutContainer(event.active.id);

    // PK: Set ActiveCard in local state
    setActiveCard(cards.find((card) => card.id === event.active.id));

    // PK: Select event for HOC
    props.cardSelect && props.cardSelect(event.active.id);
  }

  function handleDragEnd({ active, over, delta }) {
    // setActiveCard(null);
    setIsDragging(false);

    const currentCard = cards.find((card) => card.id === active.id);
    if (over) {
      // PK: Just get the coordinates from the document el by id
      // PK: enable this to use the comfort of letting the computer slide your card into to container
      // const left = dropRefs[over.id].rect.top;
      // const top = dropRefs[over.id].rect.left;
      const overEl = document.getElementById('container_' + over.id);
      const left = overEl.offsetLeft;
      const top = overEl.offsetTop;

      props.cardMoved && props.cardMoved(active.id, { left, top });
      props.cardInContainer && props.cardInContainer(active.id, over.id);

      if (props.autoSelectNextCard) {
        const cardsNotInContainer = cards
          .filter((c) => c.containerId === null) // PK: elke kaart die niet in een container zit
          .filter((c) => c.id !== active.id); // PK: plus de actieve kaart, die is namenlijk net gedropt.
        handleDragStart({
          active: {
            id:
              cardsNotInContainer.length > 0
                ? cardsNotInContainer.pop().id
                : null,
          },
        });
      }
    } else {
      const newPosition = {
        left: currentCard.position.left + delta.x,
        top: currentCard.position.top + delta.y,
      };
      props.cardMoved && props.cardMoved(active.id, newPosition);

      if (isDefined(currentCard.containerId)) {
        props.cardOutContainer && props.cardOutContainer(active.id);
      }
    }
  }
}

// PK: This routine sets the zIndex of every card after every props.cards change (see useEffect)
function reOrderCards(cards: SortCard[], activeCardId: string) {
  let cardsCorrectOrder;
  if (isDefined(activeCardId)) {
    // PK: first remove the active card
    const cardsActive = cards.filter((c) => c.id !== activeCardId);
    // PK: get the cards without container, sorted on zIndex
    const cardsWithoutContainer = cardsActive
      .filter((c) => !isDefined(c.containerId))
      .sort((a, b) => a.zIndex - b.zIndex);
    // PK: get the cards with container, sorted on zIndex
    const cardsInContainer = cardsActive
      .filter((c) => isDefined(c.containerId))
      .sort((a, b) => a.zIndex - b.zIndex);
    // PK: active card on top, then the cards without container, at the bottom the cards within a container
    cardsCorrectOrder = [
      ...cardsInContainer,
      ...cardsWithoutContainer,
      ...[cards.find((c) => c.id === activeCardId)],
    ];
  } else {
    // PK: get the cards without container, sorted on zIndex
    const cardsWithoutContainer = cards
      .filter((c) => !isDefined(c.containerId))
      .sort((a, b) => a.zIndex - b.zIndex);
    // PK: get the cards with container, sorted on zIndex
    const cardsInContainer = cards
      .filter((c) => isDefined(c.containerId))
      .sort((a, b) => a.zIndex - b.zIndex);
    // PK: first the cards without container, at the bottom the cards within a container
    cardsCorrectOrder = [...cardsInContainer, ...cardsWithoutContainer];
  }
  // PK: remap al zIndexes from 100 to 100+length array of all cards
  const cardsCorrectZIndex = cardsCorrectOrder.map((c, index) => ({
    ...c,
    zIndex: 100 + index,
  }));
  // PK: set back in same order of the original cards array
  const cardsCorrectInArray = cards.map((ca) =>
    cardsCorrectZIndex.find((co) => co.id === ca.id)
  );
  return cardsCorrectInArray;
}

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
