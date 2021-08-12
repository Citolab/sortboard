import { Listbox } from '@headlessui/react';
import { UserInfoType } from '@sortboard/data';
import React, { useEffect, useState } from 'react';
import { SelectorIcon } from '@heroicons/react/solid';
import { SortMoji } from './SortMoji';
interface Props {
  onChanged?: (data: UserInfoType) => void;
}
export function UserInfo(props: Props) {
  const [state, setState] = useState<UserInfoType>({
    gender: '',
    group: '',
  });

  return (
    <div className="text-gray-800">
      <h1 className="header text-primary font-bold mb-3 flex items-center text-2xl">
        <div className="pr-2">Dit ben jij.</div>
        <SortMoji text="🤔"></SortMoji>
      </h1>
      <div className="mb-3">Kan je nog iets over jezelf vertellen?</div>
      <div>
        <p className="italic text-gray-400">Wat is je leeftijd?</p>
        <div className="mb-4">
          <Listbox
            value={state.group}
            onChange={(group) => {
              const newState = { ...state, group };
              setState(newState);
              if (props.onChanged) props.onChanged(newState);
            }}
          >
            <Listbox.Button className="relative w-1/2 py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
              <span className="block truncate">
                {state.group ? state.group : 'Leeftijd'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="z-10  absolute w-1/2 p-4 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {['9 jaar', '10 jaar', '11 jaar', '12 jaar', '13 jaar', 'anders'].map((g) => (
                <Listbox.Option key={g} value={g}>
                  {g}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>
      <div>
        <p className="italic text-gray-400">Wat is je geslacht?</p>
        <div className="mb-12">
          <Listbox
            value={state.gender}
            onChange={(gender) => {
              const newState = { ...state, gender };
              setState(newState);
              if (props.onChanged) props.onChanged(newState);
            }}
          >
            <Listbox.Button className="relative w-1/2 py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
              <span className="block truncate">
                {state.gender ? state.gender : 'Geslacht'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="z-10 absolute w-1/2 p-4 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {['Jongen', 'Meisje', 'anders'].map((g) => (
                <Listbox.Option key={g} value={g}>
                  {g}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>
    </div>
  );
}
