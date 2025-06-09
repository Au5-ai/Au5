"use strict";
const languageOption = Object.freeze({
    Afrikaans: {
        id: 98,
        shortName: "af-ZA",
        optionName: "Afrikaans (South Africa)",
    },
    Albanian: {
        id: 113,
        shortName: "sq-AL",
        optionName: "Albanian (Albania)",
    },
    AmharicEthiopia: {
        id: 99,
        shortName: "am-ET",
        optionName: "Amharic (Ethiopia)",
    },
    ArabicArabEmirates: {
        id: 84,
        shortName: "ar-AE",
        optionName: "Arabic (Arab Emirates)",
    },
    ArabicEgypt: {
        id: 47,
        shortName: "ar-EG",
        optionName: "Arabic (Egypt)",
    },
    ArabicLevant: {
        id: 85,
        shortName: "ar-x-LEVANT",
        optionName: "Arabic (Levant)",
    },
    ArabicMeghrebi: {
        id: 86,
        shortName: "ar-x-MAGHREBI",
        optionName: "Arabic (Maghrebi)",
    },
    Armenian: {
        id: 137,
        shortName: "hy-AM",
        optionName: "Armenian",
    },
    Azerbaijani: {
        id: 100,
        shortName: "az-AZ",
        optionName: "Azerbaijani (Azerbaijan) BETA",
    },
    Basque: {
        id: 103,
        shortName: "eu-ES",
        optionName: "Basque",
    },
    Bengali: {
        id: 87,
        shortName: "bn-BD",
        optionName: "Bengali (Bangladesh)",
    },
    Bulgarian: {
        id: 81,
        shortName: "bg-BG",
        optionName: "Bulgarian (Bulgaria)",
    },
    Burmese: {
        id: 126,
        shortName: "my-MM",
        optionName: "Burmese (Myanmar)",
    },
    Catalan: {
        id: 129,
        shortName: "ca-ES",
        optionName: "Catalan (Spain)",
    },
    ChineseMandarinSimplified: {
        id: 34,
        shortName: "cmn-Hans-CN",
        optionName: "Chinese, Mandarin (Simplified)",
    },
    ChineseMandarinTraditional: {
        id: 35,
        shortName: "cmn-Hant-TW",
        optionName: "Chinese, Mandarin (Traditional)",
    },
    Czech: {
        id: 93,
        shortName: "cs-CZ",
        optionName: "Czech (Czechia) BETA",
    },
    Danish: {
        id: 94,
        shortName: "da-DK",
        optionName: "Danish (Denmark) BETA",
    },
    DutchBelgium: {
        id: 23,
        shortName: "nl-BE",
        optionName: "Dutch (Belgium) BETA",
    },
    Dutch: {
        id: 8,
        shortName: "nl-NL",
        optionName: "Nederlands",
    },
    English: {
        id: 1,
        shortName: "en-US",
        optionName: "English",
    },
    EnglishCanada: {
        id: 21,
        shortName: "en-CA",
        optionName: "English (Canada)",
    },
    EnglishAustralian: {
        id: 22,
        shortName: "en-AU",
        optionName: "English (Australian)",
    },
    EnglishIndia: {
        id: 19,
        shortName: "en-IN",
        optionName: "English (India)",
    },
    EnglishPhilippines: {
        id: 102,
        shortName: "en-PH",
        optionName: "English (Philippines)",
    },
    EnglishUnitedKingdom: {
        id: 20,
        shortName: "en-GB",
        optionName: "English (United Kingdom)",
    },
    Estonian: {
        id: 119,
        shortName: "et-EE",
        optionName: "Estonian (Estonia)",
    },
    Filipino: {
        id: 120,
        shortName: "fil-PH",
        optionName: "Filipino (Plilippines)",
    },
    Finnish: {
        id: 95,
        shortName: "fi-FI",
        optionName: "Finnish (Finland)",
    },
    French: {
        id: 5,
        shortName: "fr-FR",
        optionName: "French",
    },
    FrenchCanadian: {
        id: 73,
        shortName: "fr-CA",
        optionName: "French (Canada)",
    },
    Galician: {
        id: 130,
        shortName: "gl-ES",
        optionName: "Galician (Canada)",
    },
    Georgian: {
        id: 122,
        shortName: "ka-GE",
        optionName: "Georgian (Georgia)",
    },
    German: {
        id: 6,
        shortName: "de-DE",
        optionName: "German",
    },
    Greek: {
        id: 101,
        shortName: "el-GR",
        optionName: "Greek (Greece) BETA",
    },
    Gujarati: {
        id: 88,
        shortName: "gu-IN",
        optionName: "Gujarati (India)",
    },
    Hebrew: {
        id: 105,
        shortName: "he-IL",
        optionName: "Hebrew (Israel)",
    },
    Hindi: {
        id: 18,
        shortName: "hi-IN",
        optionName: "Hindi",
    },
    Hungarian: {
        id: 106,
        shortName: "hu-HU",
        optionName: "Hungarian (Hungary)",
    },
    Icelandic: {
        id: 121,
        shortName: "is-IS",
        optionName: "Icelandic (Iceland) BETA",
    },
    Indonesian: {
        id: 41,
        shortName: "id-ID",
        optionName: "Indonesian (Indonesia)",
    },
    Italian: {
        id: 7,
        shortName: "it-IT",
        optionName: "Italiano",
    },
    Japanese: {
        id: 9,
        shortName: "ja-JP",
        optionName: "\u65E5\u672C\u8A9E",
    },
    Javanese: {
        id: 108,
        shortName: "jv-ID",
        optionName: "Javanese (Indonesia)",
    },
    Kannada: {
        id: 89,
        shortName: "kn-IN",
        optionName: "Kannada (India)",
    },
    Kazakh: {
        id: 191,
        shortName: "kk-KZ",
        optionName: "Kazakh (Kazakhstan) BETA",
    },
    Khmer: {
        id: 82,
        shortName: "km-KH",
        optionName: "Khmer (Cambodia)",
    },
    Kinyarwanda: {
        id: 83,
        shortName: "rw-RW",
        optionName: "Kinyarwanda (Rwanda)",
    },
    Korean: {
        id: 11,
        shortName: "ko-KR",
        optionName: "\uD55C\uAD6D\uC5B4",
    },
    Lao: {
        id: 96,
        shortName: "lo-LA",
        optionName: "Lao (Laos) BETA",
    },
    Lithuanian: {
        id: 131,
        shortName: "lt-LT",
        optionName: "Lithuanian (Lithuania) BETA",
    },
    Latvian: {
        id: 132,
        shortName: "lv-LV",
        optionName: "Latvian (Latvia)",
    },
    Macedonian: {
        id: 125,
        shortName: "mk-MK",
        optionName: "Macedonian (North Macedonia)",
    },
    Malay: {
        id: 43,
        shortName: "ms-MY",
        optionName: "Malay (Malaysia)",
    },
    Malayalam: {
        id: 90,
        shortName: "ml-IN",
        optionName: "Malayalam (India)",
    },
    Mongolian: {
        id: 109,
        shortName: "mn-MN",
        optionName: "Mongolian (Mongolia)",
    },
    Nepali: {
        id: 127,
        shortName: "ne-NP",
        optionName: "Nepali (Nepal)",
    },
    NorthernSotho: {
        id: 75,
        shortName: "nso-ZA",
        optionName: "Northern Sotho (South Africa)",
    },
    Norwegian: {
        id: 25,
        shortName: "nb-NO",
        optionName: "Norwegian (Norway)",
    },
    Persian: {
        id: 104,
        shortName: "fa-IR",
        optionName: "Persian (Iran)",
    },
    Polish: {
        id: 39,
        shortName: "pl-PL",
        optionName: "Polski",
    },
    PortugueseBrazil: {
        id: 4,
        shortName: "pt-BR",
        optionName: "Portuguese (Brazil)",
    },
    PortuguesePortugal: {
        id: 17,
        shortName: "pt-PT",
        optionName: "Portuguese (Portugal)",
    },
    Romanian: {
        id: 40,
        shortName: "ro-RO",
        optionName: "Romanian (Romania)",
    },
    Russian: {
        id: 10,
        shortName: "ru-RU",
        optionName: "Russian",
    },
    Serbian: {
        id: 134,
        shortName: "sr-RS",
        optionName: "Serbian (Serbia) BETA",
    },
    Sesotho: {
        id: 76,
        shortName: "st-ZA",
        optionName: "Sesotho (South Africa)",
    },
    Sinhala: {
        id: 128,
        shortName: "si-LK",
        optionName: "Sinhala (Sri Lanka)",
    },
    Slovak: {
        id: 112,
        shortName: "sk-SK",
        optionName: "Slovak (Slovakia)",
    },
    Slovenian: {
        id: 133,
        shortName: "sl-SI",
        optionName: "Slovenian (Slovenia)",
    },
    SpanishMexico: {
        id: 2,
        shortName: "es-MX",
        optionName: "Spanish (Mexico)",
    },
    SpanishSpain: {
        id: 3,
        shortName: "es-ES",
        optionName: "Spanish (Spain)",
    },
    Sundanese: {
        id: 123,
        shortName: "su-ID",
        optionName: "Sundanese (Indonesia)",
    },
    Swahili: {
        id: 97,
        shortName: "sw",
        optionName: "Swahili",
    },
    Swati: {
        id: 77,
        shortName: "ss-latn-ZA",
        optionName: "Swati (South Africa)",
    },
    Swedish: {
        id: 24,
        shortName: "sv-SE",
        optionName: "Swedish (Sweden)",
    },
    Tamil: {
        id: 114,
        shortName: "ta-IN",
        optionName: "Tamil (India)",
    },
    Telugu: {
        id: 115,
        shortName: "te-IN",
        optionName: "Telugu (India)",
    },
    Thai: {
        id: 37,
        shortName: "th-TH",
        optionName: "\u0E44\u0E17\u0E22 (Thai)",
    },
    Tswana: {
        id: 79,
        shortName: "tn-latn-ZA",
        optionName: "Tswana (South Africa)",
    },
    Turkish: {
        id: 38,
        shortName: "tr-TR",
        optionName: "T\xFCrk\xE7e (Turkey)",
    },
    Ukrainian: {
        id: 44,
        shortName: "uk-UA",
        optionName: "Ukrainian (Ukraine) BETA",
    },
    Urdu: {
        id: 116,
        shortName: "ur-PK",
        optionName: "Urdu (Pakistan)",
    },
    Uzbek: {
        id: 117,
        shortName: "uz-UZ",
        optionName: "Uzbek (Uzbekistan) BETA",
    },
    Vietnamese: {
        id: 42,
        shortName: "vi-VN",
        optionName: "Ti\u1EBFng Vi\u1EC7t (Vietnam)",
    },
    Xhosa: {
        id: 74,
        shortName: "xh-ZA",
        optionName: "Xhosa (South Africa)",
    },
    Xitsonga: {
        id: 80,
        shortName: "ts-ZA",
        optionName: "Xitsonga (South Africa)",
    },
    Zulu: {
        id: 118,
        shortName: "zu-ZA",
        optionName: "Zulu (South Africa)",
    },
});
