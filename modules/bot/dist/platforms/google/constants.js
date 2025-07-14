"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Google_Caption_Configuration = exports.RANDOM_DELAY_MAX = exports.WAIT_FOR_JOIN_BUTTON_TIMEOUT = exports.WAIT_FOR_NAME_FIELD_TIMEOUT = void 0;
exports.WAIT_FOR_NAME_FIELD_TIMEOUT = 120000;
exports.WAIT_FOR_JOIN_BUTTON_TIMEOUT = 60000;
exports.RANDOM_DELAY_MAX = 1000;
exports.Google_Caption_Configuration = {
    transcriptSelectors: {
        aria: 'div[role="region"][tabindex="0"]',
        fallback: ".a4cQT",
        overlay: ".NmXUuc.P9KVBf.IGXezb",
    },
};
