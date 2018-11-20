const ffi = require("ffi");
const path = require("path");

const { DLLTYPE } = require("./dllstruct");
const { uint32Array, voidPP } = DLLTYPE;

/*
使用特定的设备名称，申请并初始化上下文
[OUT] ppPAEWContext：用于存储初始化好的上下文结构体的指针的地址，不可为NULL，使用完毕后，*ppPAEWContext需要传入PAEW_FreeContext来释放资源
[IN] szDeviceName：由node-usb模块检测设备插拔得到的设备名称，由三个字段组成：“busNumber:deviceAddress:interfaceNumber”，使用“%04x:%04x:%02x”的格式进行格式化
[IN] pProcCallback：用来接收进度信息的回调函数
[IN] pCallbackParam：回调函数的参数
[RETURN] PAEW_RET_SUCCESS为成功，非PAEW_RET_SUCCESS值为失败
*/
//int EWALLET_API PAEW_InitContextWithDevName(void ** const ppPAEWContext, const char * const szDeviceName, const tFunc_Proc_Callback pProcCallback, callback_param * const pCallbackParam);

/*
申请并初始化上下文
[OUT] ppPAEWContext：用于存储初始化好的上下文结构体的指针的地址，不可为NULL，使用完毕后，*ppPAEWContext需要传入PAEW_FreeContext来释放资源
[OUT] pnDevCount：返回枚举到的设备数量
[IN] pProcCallback：用来接收进度信息的回调函数
[IN] pCallbackParam：回调函数的参数
[RETURN] PAEW_RET_SUCCESS为成功，非PAEW_RET_SUCCESS值为失败
*/
//int EWALLET_API PAEW_InitContext(void ** const ppPAEWContext, size_t * const pnDevCount, const tFunc_Proc_Callback pProcCallback, callback_param * const pCallbackParam);

/*
释放上下文
[IN] pPAEWContext：上下文结构体指针，不可为NULL
[RETURN] PAEW_RET_SUCCESS为成功，非PAEW_RET_SUCCESS值为失败
*/
//int EWALLET_API PAEW_FreeContext(void * const pPAEWContext);

/*
获取某一设备的硬件信息
[IN] pPAEWContext：上下文结构体指针，不可为NULL
[IN] nDevIndex：操作的设备索引号，范围为[0, nDevCount-1]
[IN] nDevInfoType：获取的设备信息类型，取值为PAEW_DEV_INFOTYPE_XXX的异或组合
[OUT] pDevInfo：返回的设备信息，不可为NULL
[RETURN] PAEW_RET_SUCCESS为成功，非PAEW_RET_SUCCESS值为失败
*/
//int EWALLET_API PAEW_GetDevInfo(void * const pPAEWContext, const size_t nDevIndex, const uint32_t nDevInfoType, PAEW_DevInfo * const pDevInfo);

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
