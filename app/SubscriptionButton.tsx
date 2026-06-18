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
      <button
        onClick={handleSubscribe}
        style={{
          background: subscribed ? "#444" : "#ff0000",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          fontSize: "18px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </button>

      <p>{count} subscribers</p>
    </div>
  );
}
