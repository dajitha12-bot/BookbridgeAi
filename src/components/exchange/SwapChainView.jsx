"use client";
import SwapChainClient from "../../app/dashboard/swapchain/SwapChainClient";
function SwapChainView({ swapchains = [] }) {
  return <SwapChainClient initialSwapchains={swapchains} />;
}
export {
  SwapChainView
};
