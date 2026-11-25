"use client";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { usePageContext } from "../context/PageContext";

type Props = {
  siteName: string;
  baseline: string;
};

const Splash = ({ siteName, baseline }: Props) => {
  const { splashed, setSplashed } = usePageContext();
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const delay = 1000;
  useEffect(() => {
    setReady(true);

    setTimeout(() => {
      setCompleted(true);
      setTimeout(() => {
        setSplashed(true);
      }, delay);
    }, delay * 4);
  }, []);

  console.log({ splashed });
  return splashed ? null : (
    <div
      className={clsx(
        "splash",
        ready && "is-ready",
        completed && "is-completed",
      )}
      style={
        {
          "--transition-duration": `${delay}ms`,
          "--transition-delay": `${delay / 3}ms`,
        } as React.CSSProperties
      }>
      <div className='spacer'></div>
      <div className='inner flex flex-col justify-between md:grid md:grid-cols-6 items-start gap-sm'>
        <div className='site-name'>{siteName}</div>
        <div className='site-baseline'>{baseline}</div>
      </div>
    </div>
  );
};

export default Splash;
