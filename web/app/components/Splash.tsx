"use client";
import clsx from "clsx";
import React, { useEffect, useState } from "react";

type Props = {
  siteName: string;
  baseline: string;
};

const Splash = ({ siteName, baseline }: Props) => {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    setReady(true);

    setTimeout(() => {
      setCompleted(true);
    }, 2000);
  }, []);
  return (
    <div
      className={clsx(
        "splash",
        ready && "is-ready",
        completed && "is-completed",
      )}>
      <div className='spacer'></div>
      <div className='inner flex flex-col justify-between md:grid md:grid-cols-6 items-start gap-sm'>
        <div className='site-name'>{siteName}</div>
        <div className='site-baseline'>{baseline}</div>
      </div>
    </div>
  );
};

export default Splash;
