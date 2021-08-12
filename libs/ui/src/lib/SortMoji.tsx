import React from 'react';
// import { Twemoji } from 'react-emoji-render';
import emoji from 'react-easy-emoji';

export function SortMoji({ text }) {
  return (
    text ?
    <>
      {emoji(text, {
        baseUrl: 'https://twemoji.maxcdn.com/2/svg/',
        ext: '.svg',
        size: '',
      })}
    </> :
    null
  );
}

// children ? <Twemoji svg className="flex" text={children} /> : <span></span>
