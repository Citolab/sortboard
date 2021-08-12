import React from 'react';
import { DndContext } from '@dnd-kit/core';
import Draggable from './Draggable';
import {Droppable} from './Droppable';

export default { title: 'Draggable', component: Draggable };

export const Normal = () => (
  <DndContext>
    <Draggable id="myDraggable">
      <div className="w-64 p-2 rounded shadow-md">
        Draggable in DndContext
      </div>
    </Draggable>
  </DndContext>
);

export const Startposition = () => (
  <DndContext>
    <Draggable id="myDraggable" position={{left: 200, top: 200}}>
      <div className="w-64 p-2 rounded shadow-md">
        With a start position
      </div>
    </Draggable>
  </DndContext>
);

export const WithDroppable = () => (
    <DndContext>
    <Draggable id="myDraggable" position={{left: 200, top: 200}}>
        <div className="w-64 h-32 p-2 rounded shadow-md">
          Is there a droppable in sight?
        </div>
      </Draggable>
      <Droppable id="myDroppable">
        <div className="w-64 h-32 p-2 border border-primary">
          You can drop me here
        </div>
      </Droppable>
    </DndContext>
  );
