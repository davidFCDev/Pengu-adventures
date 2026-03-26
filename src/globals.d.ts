/**
 * Global type declarations for externally loaded libraries
 */

// Phaser is loaded globally via CDN
declare const Phaser: typeof import("phaser");

// Import the actual SDK types from the package
import type { FarcadeSDK } from "@farcade/game-sdk";

// Farcade SDK is loaded globally via CDN
declare const FarcadeSDK: FarcadeSDK;

// Extend window for global SDK access
declare global {
  interface Window {
    FarcadeSDK?: FarcadeSDK;
    __accumulatedScore?: number;
    __currentLives?: number; // Lives persisted across levels (1-3)
    __savedLevel?: string;
    __scoreLockedByGame?: boolean; // Prevents SDK from clobbering score after game starts
  }
}

export {};
