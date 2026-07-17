import React, { useState, useEffect } from "react";

export type CountDownProps = {
  resetCodeSend: () => void;
  seconds: number;
  storageKey?: string;
};

const CountdownTimer: React.FC<CountDownProps> = (props: CountDownProps) => {
  const storageKey = props.storageKey || "sms-remain-seconds";
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    props.seconds
  );

  useEffect(() => {
    if (remainingSeconds > 0) {
      const countdown = setInterval(() => {
        setRemainingSeconds((prevSeconds) => prevSeconds - 1);
        let remainInfo = localStorage.getItem(storageKey);
        if (remainInfo && remainInfo.length > 0) {
          let remain = JSON.parse(remainInfo);
          remain.remainSeconds = remain.remainSeconds - 1;
          localStorage.setItem(storageKey, JSON.stringify(remain));
        } else {
          let remain = {
            createdTime: new Date().getTime(),
            remainSeconds: remainingSeconds - 1,
          };
          localStorage.setItem(storageKey, JSON.stringify(remain));
        }
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [remainingSeconds, storageKey]);

  const renderCounter = () => {
    if (remainingSeconds > 0) {
      return `距离下次发送时间: ${remainingSeconds} 秒`;
    } else {
      localStorage.removeItem(storageKey);
      props.resetCodeSend();
    }
  };

  return <div>{renderCounter()}</div>;
};

export default CountdownTimer;
