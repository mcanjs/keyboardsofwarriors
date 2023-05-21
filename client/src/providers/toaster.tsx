'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastifyProvider() {
  return <Toaster position="top-center" reverseOrder={false} gutter={8} />;
}
