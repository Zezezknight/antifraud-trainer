import { useEffect, useRef, useState } from 'react';
import { Progress } from './ui/progress';
import { useNavigation } from 'react-router';

const SHOW_DELAY_MS = 150; // не показываем бар на быстрых переходах, чтобы не мигал
const INCREMENT_INTERVAL_MS = 300;
const MAX_FAKE_PROGRESS = 90; // дальше не ползём сами — ждём реального завершения
const COMPLETE_HOLD_MS = 200; // сколько держим 100% перед скрытием

function TopProgressBar() {
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === 'loading' || navigation.state === 'submitting';

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const showTimeoutRef = useRef<number | undefined>(undefined);
  const incrementIntervalRef = useRef<number | undefined>(undefined);
  const hideTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isNavigating) {
      showTimeoutRef.current = setTimeout(() => {
        setVisible(true);
        setProgress(10); // стартовый скачок, чтобы бар не начинался с нуля незаметно

        incrementIntervalRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= MAX_FAKE_PROGRESS) return prev;
            const remaining = MAX_FAKE_PROGRESS - prev;
            return prev + remaining * 0.1; // асимптотически замедляется к 90%
          });
        }, INCREMENT_INTERVAL_MS);
      }, SHOW_DELAY_MS);
    } else {
      // навигация завершилась
      clearTimeout(showTimeoutRef.current);
      clearInterval(incrementIntervalRef.current);

      setVisible(prevVisible => {
        if (!prevVisible) return false; // бар и не успел показаться — просто гасим таймеры выше
        setProgress(100);
        hideTimeoutRef.current = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, COMPLETE_HOLD_MS);
        return prevVisible;
      });
    }

    return () => {
      clearTimeout(showTimeoutRef.current);
      clearInterval(incrementIntervalRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <Progress className="fixed top-0 left-0 w-full z-100" value={progress} />
  );
}

export default TopProgressBar;
