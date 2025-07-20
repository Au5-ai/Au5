"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomDelay = randomDelay;
exports.delay = delay;
/**
 * Returns a random delay within +/- 10% of the given amount.
 * Ensures the result is always positive and at least 0.
 */
function randomDelay(amount) {
    const variation = amount * 0.1;
    const min = Math.max(0, amount - variation);
    const max = amount + variation;
    return Math.random() * (max - min) + min;
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
