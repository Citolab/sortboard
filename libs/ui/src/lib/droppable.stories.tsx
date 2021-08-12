import React from 'react';
import { Droppable } from './Droppable';


export default { title: 'Droppable', component: Droppable };

export const Normal = () => <Droppable id="drop1">
    <div>this can be a droppable</div>
</Droppable>