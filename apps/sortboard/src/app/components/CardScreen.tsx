import { OtherUsers } from '@sortboard/ui';
import React, { useEffect, useRef, useState } from 'react';

export const CardScreen = (props) => (
  <div
    style={{
      backgroundImage: `linear-gradient( 0deg, transparent 60%, transparent 60%, #E2FBFF 0%, #E2FBFF 60%)`,
    }}
    className="h-full w-full flex flex-col items-center justify-center bg-gray-50"
  >
    <div className="flex">
      <OtherUsers condensed={true}></OtherUsers>
    </div>
    {props.children}
  </div>
);
