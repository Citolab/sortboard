import React, { useImperativeHandle } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Drop } from './Drop';

interface Props {
  id?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Droppable(props: any) {
  // TODO: On sort, disabled drop if has one member in it https://docs.dndkit.com/api-documentation/droppable/usedroppable#disabled
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
    disabled: props.disabled,
  });

  return <Drop ref={setNodeRef} id={`container_${props.id}`} isOver={isOver} disabled={props.disabled}></Drop>;
}

// className={`card transition duration-200 ease-in-out group transform-gpu z-0 ${ isOver && 'scale-110' }`}
// id={`container_${props.id}`}
