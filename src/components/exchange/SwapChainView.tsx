'use client';

import React from 'react';
import SwapChainClient from '../../app/dashboard/swapchain/SwapChainClient';

export function SwapChainView({ swapchains = [] }: { swapchains?: any[] }) {
  return <SwapChainClient initialSwapchains={swapchains} />;
}
