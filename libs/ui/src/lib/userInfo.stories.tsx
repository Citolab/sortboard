import React from 'react';
import { UserInfo } from './UserInfo';

export default { title: 'dialoog/UserInfo', component: UserInfo };


export const Normal = () => <UserInfo onChanged={(event) => console.log(event)}></UserInfo>

