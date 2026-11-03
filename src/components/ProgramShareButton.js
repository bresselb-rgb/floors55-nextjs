// src/components/ProgramShareButton.js
"use client";

import React, { useState } from "react";

export default function ProgramShareButton({ url, title, shareText, buttonLabel = "Share Resource with a Client" }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const fullMessage = `${shareText}\n${url}`;
    const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (typeof navigator !== "undefined" && navigator.share && isMobile) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Failed to copy link", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 hover:border-[#c5a059] px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm"
    >
      <svg className="w-4 h-4 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316M15 12a3 3 0 100 6 3 3 0 000-6zm0-6a3 3 0 100 6 3 3 0 000-6z" />
      </svg>
      {copied ? "✓ Client Link Copied to Clipboard!" : buttonLabel}
    </button>
  );
}