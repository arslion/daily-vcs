import * as React from 'react';
import { Image } from '#vcs-react/components';

/*
  This component is intentionally empty.
  
  You can override it by providing a replacement source file through the Daily API.
*/

export default function CustomOverlay() {
  const src = 'test_square';
  const opacity = 0.5;
  return <Image src={src} blend={{ opacity }} />;

  // return null;
}
