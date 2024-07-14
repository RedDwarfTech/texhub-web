import React, { useState, useEffect } from "react";

export type CountDownProps = {
  resetCodeSend: () => void;
  seconds: number;
};

const CountdownTimer: React.FC<CountDownProps> = (props: CountDownProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    props.seconds
  );

  useEffect(() => {
    if (remainingSeconds > 0) {
      const countdown = setInterval(() => {
        setRemainingSeconds((prevSeconds) => prevSeconds - 1);
        let remainInfo = localStorage.getItem("sms-remain-seconds");
        if (remainInfo && remainInfo.length > 0) {
          let remain = JSON.parse(remainInfo);
          remain.remainSeconds = remain.remainSeconds - 1;
          localStorage.setItem("sms-remain-seconds", JSON.stringify(remain));
        } else {
          let remain = {
            createdTime: new Date().getTime(),
            remainSeconds: remainingSeconds - 1,
          };
          localStorage.setItem("sms-remain-seconds", JSON.stringify(remain));
        }
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [remainingSeconds]);

  const renderCounter = () => {
    if (remainingSeconds > 0) {
      return `距离下次发送时间: ${remainingSeconds} 秒`;
    } else {
      props.resetCodeSend();
    }
  };

  return <div>{renderCounter()}</div>;
};

export default CountdownTimer;
