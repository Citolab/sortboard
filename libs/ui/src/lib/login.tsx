import React, { useState } from 'react';

interface Props {
  canSkip?: boolean;
  code?: string;
  checking?: boolean;
  errorMessage?: string;
  doLogin?: (code: string) => void;
}
export function Login(props: Props) {
  const [code, setCode] = useState('');

  const login = () => {
    if (code || props.canSkip === true) {
      props.doLogin(code);
      setCode('');
    }
  };
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <label
          className="block header text-primary font-bold mb-2  text-2xl"
          htmlFor="password"
        >
          Code
        </label>
        <input
          className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
          id="password"
          type="text"
          value={code}
          disabled={props.checking}
          placeholder="*****"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              login();
            }
          }}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
        <p className="text-muted-400 text-xs italic">
          Voer de code op het scherm in.
        </p>

        {!code && props.errorMessage ? (
          <p className="text-red-500">{props.errorMessage}</p>
        ) : (
          ''
        )}
      </div>
      <div className="rounded-lg shadow">
        {/* <Link href="/sort"> */}
        <button
          onClick={(e) => {
            e.preventDefault();
            login();
          }}
          className="header w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10"
        >
          {props.checking ? 'Bezig met controleren..' : 'Ik heb een code'}
        </button>
        {/* </Link> */}
      </div>
    </div>
  );
}
