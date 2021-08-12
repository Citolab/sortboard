import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { defaultCoordinates, Translate, useDraggable } from '@dnd-kit/core';
import { Card } from './Card';
interface Props {
  id: string;
  children: React.ReactNode;
  position?: { left: number; top: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element?: any;
  zIndex?: number;
}

export function Draggable({children, position, zIndex, ...props}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: props.id,
  });

  // PK: Keeps the absolutely positioned state within this draggable
  // Borrowed from example: https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/1%20-%20Core/Draggable/1-Draggable.story.tsx#L55
  // const [{ translate, initialTranslate }, setTranslate] = useState<{
  //   initialTranslate: Translate;
  //   translate: Translate;
  // }>({ initialTranslate: defaultCoordinates, translate: defaultCoordinates });

  // // PK: Listen to transform which will give us the delta while dragging
  // useEffect(() => {
  //   if (transform) {
  //     // PK: If transform is available set new position with the delta
  //     setTranslate(({ initialTranslate }) => ({
  //       initialTranslate,
  //       translate: {
  //         x: transform.x,
  //         y: transform.y,
  //       },
  //     }));
  //   } else {
  //     // PK: If transform is gone, this effect will run once more and do this else block

  //     // PK: Set the translate position within.. or we could wait for the props to enter
  //     // setTranslate(({ translate }) => ({
  //     //   translate: {x:0, y:0},
  //     //   initialTranslate: translate,
  //     // }));
  //   }
  // }, [transform]);

  // // PK: Listen to the props position, and if none, use default position
  // useEffect(() => {
  //   setTranslate(({ initialTranslate }) => ({
  //     initialTranslate : {
  //       x: position?.left ?? 0,
  //         y: position?.top ?? 0,
  //     },
  //     translate: {
  //       x: 0,
  //       y: 0,
  //     },
  //   }));

  // }, [position]);

  // // translate while dragging, left top when finished
  // const style = {
  //   transform: `translate3d(${translate?.x ?? 0}px, ${translate?.y ?? 0}px, 0)`,
  //     // : `translate3d(0px, 0px, 0)`,
  //   left: `${position?.left}px`,
  //   top: `${position?.top}px`,
  //   zIndex: zIndex,
  // };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      {...props}
      // className={`touch-action-none select-none ${!isDragging && `transition-all delay-75`}`}
      // style={style}
      
      className={`touch-action-none select-none absolute`}
      style={{ left: position?.left ?? 0, top: position?.top ?? 0, zIndex, opacity: isDragging ? 0 : undefined }}
    >
      {/* <pre>{JSON.stringify(position)}</pre> */}
      {children}
    </Card>
  );
}