"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(1);

  function handleSubscribe() {
    if (!subscribed) {
      setSubscribed(true);
      setCount(count + 1);
    }
  }

  return (
    <div style={{ marginBottom: "30px" }}>
      <button onClick={handleSubscribe}>
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </button>

      <h2 style={{ color: "white", marginTop: "12px" }}>
        {count} subscribers
      </h2>
    </div>
  );
}
