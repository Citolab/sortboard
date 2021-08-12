import React from 'react';

import { DndContext } from '@dnd-kit/core';
import { DropThree } from './DropThree';

export default { title: 'DropThree', component: DropThree };


export const Normal = () => <DndContext>
    <DropThree text={['text', 'text2', 'text3']}></DropThree>
</DndContext>