import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import React, { Fragment } from 'react';

interface Props {
  text?: string;
  onSelect?: (id: string) => void;
  items: {
    id: string;
    text: string;
  }[];
}

export function Dropdown(props: Props) {
  return (
    <Menu>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                {props.text ?? 'Options'}
                <ChevronDownIcon
                  className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="px-1 py-1 ">
                  {props.items.map((item) => (
                    <Menu.Item key={item.id}>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            if (props.onSelect) props.onSelect(item.id);
                          }}
                          className={`${
                            active ? 'bg-primary text-white' : 'text-gray-900'
                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                        >
                          {item.text}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      {/* <Menu.Button>{ props.text }</Menu.Button>
      <Menu.Items>
        { props.items.map(item => <Menu.Item key={item.id}>
          {({ active }) => (
            <button
            onClick={() => {
                if (props.onSelect) props.onSelect(item.id);
            }}
              className={`${active && "bg-primary"}`}
            >
              {item.title}
            </button>
          )}
        </Menu.Item>) }
      </Menu.Items> */}
    </Menu>
  );
}
