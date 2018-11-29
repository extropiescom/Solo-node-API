const ffi = require("ffi");
const path = require("path");

const { DLLTYPE } = require("./dllstruct");
const { uint32Array, uint64Array, ucharArray, strArray, voidPP } = DLLTYPE;

if (process.env.LIBDIR == undefined || process.env.LIBDIR == "") {
    process.env.LIBDIR = __dirname;
}

const DLLAPI = ffi.Library(path.resolve(process.env.LIBDIR, "EWallet"), {
    PAEW_InitContextWithDevName: [
        "int",
        [voidPP, "string", "uchar", "pointer", "pointer"]
    ],
    PAEW_InitContext: ["int", [voidPP, "pointer", "pointer", "pointer"]],
    PAEW_FreeContext: ["int", ["pointer"]],
    PAEW_GetDevInfo: ["int", ["pointer", "size_t", "uint32", "pointer"]],
    PAEW_GenerateSeed: [
        "int",
        ["pointer", "size_t", "uchar", "uchar", "uchar"]
    ],
    PAEW_ImportSeed: ["int", ["pointer", "size_t", "pointer", "size_t"]],
    PAEW_DeriveTradeAddress: [
        "int",
        ["pointer", "size_t", "uchar", uint32Array, "size_t"]
    ],
    PAEW_GetTradeAddress: [
        "int",
        ["pointer", "size_t", "uchar", "uchar", "pointer", "pointer"]
    ],
    PAEW_BTC_TXSign: [
        'int',
        [
          'pointer',
          'uint64',
          'uint64',
          strArray,
          uint64Array,
          ucharArray,
          'uint64',
          strArray,
          uint64Array,
        ],
    ],
    PAEW_SetERC20Info: [
        "int",
        ["pointer", "size_t", "uchar", "pointer", "uchar"]
    ],
    PAEW_ETH_TXSign: [
        "int",
        ["pointer", "size_t", "pointer", "size_t", "pointer", "pointer"]
    ],
    PAEW_CYB_TXSign: [
        "int",
        ["pointer", "size_t", "pointer", "size_t", "pointer", "pointer"]
    ],
    PAEW_EOS_TXSign: [
        "int",
        ["pointer", "size_t", "pointer", "size_t", "pointer", "pointer"]
    ],
    PAEW_LTC_TXSign: [
        "int",
        [
            "pointer",
            "size_t",
            "size_t",
            "pointer",
            "pointer",
            "pointer",
            "size_t",
            "pointer",
            "pointer"
        ]
    ],
    PAEW_NEO_TXSign: [
        "int",
        [
            "pointer",
            "size_t",
            "size_t",
            "pointer",
            "pointer",
            "pointer",
            "size_t",
            "pointer",
            "pointer"
        ]
    ],
    PAEW_BTC_WIT_TXSign: [
        "int",
        [
            "pointer",
            "size_t",
            "size_t",
            "pointer",
            "pointer",
            "pointer",
            "size_t",
            "pointer",
            "pointer"
        ]
    ],
    PAEW_ClearCOS: ["int", ["pointer", "size_t"]],
    PAEW_UpdateCOS: ["int", ["pointer", "size_t", "pointer", "size_t"]],
    PAEW_ChangePIN: ["int", ["pointer", "size_t"]],
    PAEW_Format: ["int", ["pointer", "size_t"]],
    PAEW_RecoverSeedFromMne: [
        "int",
        ["pointer", "size_t", "pointer", "pointer"]
    ],
    PAEW_RecoverMneFromMneGroup: [
        "int",
        ["size_t", "pointer", "pointer", "pointer", "pointer"]
    ],
    PAEW_GetTradeAddressFromSeed: [
        "int",
        [
            "pointer",
            "size_t",
            uint32Array,
            "size_t",
            "pointer",
            "pointer",
            "uchar",
            "uchar",
            "pointer",
            "pointer"
        ]
    ]
});

module.exports = { DLLAPI };
