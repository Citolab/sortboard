import React from 'react';
import { SortMoji } from './SortMoji';

interface Props {
  condensed?: boolean;
}
export function OtherUsers(props: Props) {
  return (
    <>
      { !props.condensed && 
      <h1 className="header text-primary font-bold mb-3 flex items-center text-xl">
        <div className="pr-2">
          Wie staat er op het kaartje?
        </div>
        <SortMoji text="🙂🧑😎🚶"></SortMoji>
      </h1>
      }
      <Profile
        title="Vriend"
        emoji="🙂"
        description={!props.condensed ? `Denk bijvoorbeeld aan je beste vriend of vriendin, maar het mag ook je broer of zus zijn.` : ``}
      />
      <Profile
        title="Kennis"
        emoji="🧑"
        description={!props.condensed ? `Kennis is iemand die je kent maar niet heel goed. Iemand die je aardig vindt maar niet vaak spreekt. Denk bijvoorbeeld aan een klasgenoot.` : ``}
      />
      <Profile
        title="Idool"
        emoji="😎"
        description={!props.condensed ? `Idool is iemand die je heel tof vindt, maar niet zelf kent. Denk aan favoriete vlogger/zanger.` : ``}
      />
      <Profile
        title="Onbekend iemand"
        emoji="🚶"
        description={!props.condensed ? `Onbekende is iemand die je nog nooit hebt gezien.` : ``}
      />
    </>
  );
}

const Profile = ({ title, emoji, description }) => (
  <div className="mb-6 mr-4">
    <div className="flex items-center mb-1">
      <SortMoji text={emoji} />
      <div className="ml-2 text-primary-dark font-medium">{title}</div>
    </div>
    <div className="text-gray-500 text-sm ml-7">{description}</div>
  </div>
);
