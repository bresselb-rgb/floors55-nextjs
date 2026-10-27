'use client';

import { useEffect } from 'react';
import { analytics } from '../lib/firebase'; 

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Referencing the analytics object initializes it and logs the page_view
    if (analytics) {
      console.log("Firebase Analytics initialized");
    }
  }, []);

  return null;
}