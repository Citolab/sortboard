import React from 'react';
import {Card} from './Card';

export default { title: 'Card', component: Card };


export const Normal = () => <Card>Een stukje tekst in de kaart</Card>

export const Active = () => <Card isActive={true}>Een stukje tekst in de kaart</Card>