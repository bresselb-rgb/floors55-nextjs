// src/components/SeoCatalogWrapper.js
"use client";

import React, { useState, useEffect } from "react";

export default function SeoCatalogWrapper({ children }) {
  const [isWhiteLabel, setIsWhiteLabel] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasMargin = sessionStorage.getItem("client_margin") !== null;
      const hasBrand = sessionStorage.getItem("client_brand") !== null;
      const params = new URLSearchParams(window.location.search);
      const hasUrlClientParams =
        params.has("margin") ||
        params.has("brand") ||
        params.has("client") ||
        params.has("board");

      if (hasMargin || hasBrand || hasUrlClientParams) {
        setIsWhiteLabel(true);
      }
    }
  }, []);

  // Hide the B2B SEO catalog index whenever a user is in White-Label / Client Mode
  if (isWhiteLabel) return null;

  return <>{children}</>;
}