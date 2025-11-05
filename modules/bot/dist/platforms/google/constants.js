"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_CAPTION_CONFIGURATION = exports.CAPTION_UI_STABILIZATION_DELAY = exports.RANDOM_DELAY_MAX = exports.WAIT_FOR_JOIN_BUTTON_TIMEOUT = exports.WAIT_FOR_NAME_FIELD_TIMEOUT = void 0;
exports.WAIT_FOR_NAME_FIELD_TIMEOUT = 120000;
exports.WAIT_FOR_JOIN_BUTTON_TIMEOUT = 60000;
exports.RANDOM_DELAY_MAX = 1000;
exports.CAPTION_UI_STABILIZATION_DELAY = 3000;
exports.GOOGLE_CAPTION_CONFIGURATION = {
    transcriptSelectors: {
        aria: 'div[role="region"][tabindex="0"]',
        fallback: ".a4cQT",
    },
};
