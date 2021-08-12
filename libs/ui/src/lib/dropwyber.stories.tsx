import React from 'react';

import { DndContext } from '@dnd-kit/core';
import { DropThree } from './DropThree';
import { DropWyber } from './DropWyber';

export default { title: 'DropWyber', component: DropWyber };


export const Normal = () => <DndContext>
    <DropWyber></DropWyber>
</DndContext>