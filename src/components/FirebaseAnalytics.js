'use client';

import { useEffect } from 'react';
import { analytics } from '../firebase'; // Update this path if your firebase.js is in a different folder

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Referencing the analytics object initializes it and logs the page_view
    if (analytics) {
      console.log("Firebase Analytics initialized");
    }
  }, []);

  return null;
}