"use client";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { usePageContext } from "../context/PageContext";
import { fadeDown, fadeUp, Timeline } from "../lib/waapi";
import useDeviceDetect from "../hooks/useDeviceDetect";

type Props = {
  siteName: string;
  baseline: string;
};

/*
steps:
1. show site name
2. hide site name, show baseline
3. hide splash
Total animation time: 3 seconds
*/
const Splash = ({ siteName, baseline }: Props) => {
  const { splashed, setSplashed } = usePageContext();
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const sitename = useRef<HTMLDivElement>(null);
  const baselineRef = useRef<HTMLDivElement>(null);
  const tl = useRef<Timeline | null>(null);
  const duration = 750;
  const { isMobile } = useDeviceDetect();

  const slideIn = [
    { opacity: 0, transform: "translateY(-50vh)" },
    { opacity: 1, transform: "translateY(0)" },
  ];

  const slideOut = [
    { opacity: 1, transform: "translateY(0)" },
    { opacity: 0, transform: "translateY(50vh)" },
  ];

  const _setupTimeline = () => {
    if (
      !sitename?.current ||
      !baselineRef?.current ||
      !wrapper?.current
      // !spacer?.current
    )
      return;
    const headerSitenmame = document.querySelector("header .site-name");
    if (!headerSitenmame) return;
    const headerSitenmameBounding = headerSitenmame.getBoundingClientRect();
    // measured before any animation is attached = resting position (translateY(0))
    const sitenameBounding = sitename.current.getBoundingClientRect();
    const dx = headerSitenmameBounding.left - sitenameBounding.left;
    const dy = headerSitenmameBounding.top - sitenameBounding.top;
    tl.current = new Timeline({
      onUpdate: (t) => {
        //console.log(t)
      },
      onComplete: () => {
        setCompleted(true);
        // let the .is-completed fade out before unmounting
        setTimeout(() => setSplashed(true), duration);
      },
    })
      .addLabel("step1", 0)
      .add(sitename?.current, slideIn, { duration: duration })
      .add(
        baselineRef?.current,
        slideIn,
        { duration: duration },
        `-=${duration / 2}`,
      )
      .addLabel("step2", "+=500")
      .call(() => {
        // fired when the playhead reaches step2
      }, "step2")

      .add(
        sitename?.current,
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${dx}px, ${dy}px)` },
        ],
        { duration: duration },
        "step2",
      )
      .add(baselineRef?.current, slideOut, { duration: duration }, "step2")
      .add(wrapper?.current, { opacity: 0 }, { duration: duration });
  };

  useEffect(() => {
    // return;
    _setupTimeline();
    setReady(true);
    tl.current?.play();
    // kill on unmount (and on StrictMode's double effect run)
    return () => tl.current?.kill();
  }, []);

  return splashed ? null : (
    <div
      ref={wrapper}
      className={clsx(
        "splash",
        ready && "is-ready",
        completed && "is-completed",
      )}>
      <div className='inner grid grid-cols-5 md:grid-cols-6 items-center gap-sm'>
        <div className='site-name ' ref={sitename}>
          {siteName}
        </div>
        <div className='site-baseline' ref={baselineRef}>
          {baseline}
        </div>
      </div>
    </div>
  );
};

export default Splash;
