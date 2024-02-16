import React, { useState, useEffect } from 'react';

export type CountDownProps = {
    resetCodeSend: () => void;
    seconds: number;
};

const CountdownTimer: React.FC<CountDownProps> = (props: CountDownProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState(props.seconds);

    useEffect(() => {
        if (remainingSeconds > 0) {
            const countdown = setInterval(() => {
                setRemainingSeconds(prevSeconds => prevSeconds - 1);
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
    }

    return (
        <div>
            {renderCounter()}
        </div>
    );
};

export default CountdownTimer;