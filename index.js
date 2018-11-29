const ref = require("ref");
const sprintf = require("sprintf-js");
const ffi = require("ffi");


const {
    DLLAPI
} = require("./main/dllimport/dllfunction");
const {
    DLLRET,
    DLLDEVINFO,
    DLLCONST,
    DLLCOINTYPE,
    DLLDEVTYPE,
    DLLPSTEP,
    DLLPSTATUS
} = require("./main/dllimport/dllconst");
const {
    PAEW_DevInfo,
    DLLTYPE,
    CallbackParam
} = require("./main/dllimport/dllstruct");
const {
    DLLUTIL
} = require("./main/dllimport/dllutility");
const {
    uint32Array,
    uint64Array,
    ucharArray,
    strArray
} = DLLTYPE;

const voidPP = ref.refType(ref.refType(ref.types.void));

const wallet_conf = require("./config/config.json");




let {
    PAEW_InitContextWithDevName,
    PAEW_InitContext,
    PAEW_FreeContext,
    PAEW_GetDevInfo,
    PAEW_DeriveTradeAddress,
    PAEW_GetTradeAddress,
    PAEW_EOS_TXSign,
    PAEW_ETH_TXSign,
    PAEW_BTC_TXSign
} = DLLAPI;


function toHex(charArray, len) {
    var converted = '';
    var str = '';
    for (var i = 0; i < len; i++) {
        str = sprintf.sprintf('%02x', charArray[i]);
        converted = converted + str;
    }
    return converted;
}

let callbackParam = new CallbackParam();

const callbackFunc = ffi.Callback("int", [CallbackParam], function (cbparam) {
    let inspectorParam = {
        pstep: DLLPSTEP.pstep_invalid,
        pstatus: DLLPSTATUS.pstatus_invalid,
        ret_value: DLLRET.PAEW_RET_UNKNOWN_FAIL,
        dev_index: DLLCONST.INVALID_DEV_INDEX,
        dev_count: 0,
        coin_type: DLLCOINTYPE.PAEW_COIN_TYPE_INVALID,
        data: null
    };

    let strOutput = "";

    inspectorParam.pstep = cbparam.pstep;
    inspectorParam.pstatus = cbparam.pstatus;
    inspectorParam.ret_value = cbparam.ret_value;
    inspectorParam.dev_index = cbparam.dev_index;
    inspectorParam.dev_count = cbparam.dev_count;

    if (cbparam.pstep != DLLPSTEP.pstep_comm_enum_dev) {
        strOutput += sprintf.sprintf(
            "dev(%d/%d):\t",
            cbparam.dev_index + 1,
            cbparam.dev_count
        );
    } else {
        strOutput += "dev(?/?):\t";
    }

    strOutput += DLLUTIL.ewallet_step2string(cbparam.pstep) + "\t";
    strOutput += DLLUTIL.ewallet_status2string(cbparam.pstatus) + "\t";

    if (cbparam.pstatus == DLLPSTATUS.pstatus_finish) {
        strOutput += sprintf.sprintf(
            "ret_value=0x%x\t",
            cbparam.ret_value >>> 0
        );
        if (
            cbparam.pstep == DLLPSTEP.pstep_comm_addr_get &&
            cbparam.ret_value == DLLRET.PAEW_RET_SUCCESS
        ) {
            const nCoinType = ref
                .alloc(
                    ref.refType("uchar"),
                    cbparam.data.buffer.slice(0, ref.types.uchar.size)
                )
                .deref()
                .deref();
 
            const pbAddressData = cbparam.data.buffer.slice(
                ref.types.uchar.size + ref.types.size_t.size,
                cbparam.data.buffer.length
            );

            inspectorParam.coin_type = nCoinType;
            inspectorParam.data = ref
                .alloc(ref.types.CString, pbAddressData)
                .deref();

            strOutput += sprintf.sprintf(
                "coin type: %s\t",
                DLLUTIL.ewallet_cointype2string(nCoinType)
            );
            strOutput += sprintf.sprintf(
                "address: %s\t",
                ref.alloc(ref.types.CString, pbAddressData).deref()
            );
        } else if (
            cbparam.pstep == DLLPSTEP.pstep_comm_updatecos &&
            cbparam.ret_value == DLLRET.PAEW_RET_SUCCESS
        ) {
            const cosUpdate = ref
                .alloc(CallbackDataCOSUpdate, cbparam.data.buffer)
                .deref();

            inspectorParam.data = cosUpdate.nProgress;

            strOutput += sprintf.sprintf(
                "cos update progress: %%%d\t",
                cosUpdate.nProgress
            );
        }
    }

    console.log(strOutput);
});

const CheckDeviceState = async () => {
    let res = 0;
    let ppPAEWContext = ref.alloc(voidPP);
    let pnDevCount = ref.alloc("size_t");
    let pDevInfo = ref.alloc(PAEW_DevInfo);
    let devInfo = pDevInfo.deref();
    let lastState = 0;
    const pin_invalid = 1;
    const lcd_invalid = 2;
    console.log("checking device state, please make sure device is unlocked and its screen is showing nothing but WOOKONG");
    while (true) {
        try {

            ppPAEWContext = ref.alloc(voidPP);

            res = await PAEW_InitContext(ppPAEWContext, pnDevCount, null, null);
            if (res != DLLRET.PAEW_RET_SUCCESS) {
                sleep(500);
                continue;
            }
            res = await PAEW_GetDevInfo(ppPAEWContext.deref(), 0, DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE + DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LCD_STATE, pDevInfo);

            if (res != DLLRET.PAEW_RET_SUCCESS) {
                sleep(500);
                throw "";
            }

            if (devInfo.ucPINState != DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOGIN) {
                if (pin_invalid != lastState) {
                    lastState = pin_invalid;
                    console.log(`Device Pin state: ${DLLUTIL.ewallet_pinstate2string(devInfo.ucPINState)}, you should unlock it first`);
                }
                sleep(500);
                throw "";
            }

            if (devInfo.nLcdState != DLLDEVINFO.LCDSTATE.PAEW_DEV_INFO_LCD_SHOWLOGO && devInfo.nLcdState != DLLDEVINFO.LCDSTATE.PAEW_DEV_INFO_LCD_NULL) {
                console.log(`lcd_invalid: ${lcd_invalid}, lastState: ${lastState}, devInfo.nLcdState: ${devInfo.nLcdState}`);
                if (lcd_invalid != lastState) {
                    lastState = lcd_invalid;
                    console.log(`Device Lcd state: ${DLLUTIL.ewallet_lcdstate2string(devInfo.nLcdState)}, you should clear it first`);
                }
                sleep(500);
                throw "";
            }
            break;
        } catch (error) {
            //console.log("err: ", error);
        } finally {
            res = await PAEW_FreeContext(ppPAEWContext.deref());
        }
    }
}



const EOSTXSign = async (
    callbackFunc,
    callbackParam,
    derivePath,
    txData
) => {
    var signature = "";
    let ppPAEWContext = ref.alloc(voidPP);
    let pnDevCount = ref.alloc("size_t");
    let pDevInfo = ref.alloc(PAEW_DevInfo);
    let devInfo = pDevInfo.deref();

    let puiDerivePath = uint32Array(derivePath);
    let nDerivePathLen = derivePath.length;

    let pbCurrentTX = txData;
    let nCurrentTXLen = pbCurrentTX.length;
    let pbTXSig = new Buffer(DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let pnTXSigLen = ref.alloc("size_t", DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let res = 0;

    try {
        res = await new Promise((resolve, reject) => {
            PAEW_InitContext.async(
                ppPAEWContext,
                pnDevCount,
                callbackFunc,
                callbackParam.ref(),
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_InitContext fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_GetDevInfo.async(
                ppPAEWContext.deref(),
                0,
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_TYPE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_CHAIN_TYPE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SN +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_VERSION +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LIFECYCLE,
                pDevInfo,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_GetDevInfo fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_DeriveTradeAddress.async(
                ppPAEWContext.deref(),
                0,
                DLLCOINTYPE.PAEW_COIN_TYPE_EOS,
                puiDerivePath,
                nDerivePathLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_DeriveTradeAddress fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_EOS_TXSign.async(
                ppPAEWContext.deref(),
                0,
                pbCurrentTX,
                nCurrentTXLen,
                pbTXSig,
                pnTXSigLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        console.log("PAEW_EOS_TXSign completed");
                        resolve(res);
                    } else {
                        console.log("PAEW_EOS_TXSign fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });
        if (res == DLLRET.PAEW_RET_SUCCESS) {
            signature = DLLUTIL.ewallet_chararray_to_string(
                pbTXSig,
                pnTXSigLen.deref() - 1
            );
        }

        return {
            result: res,
            payload: signature
        };

    } catch (err) {
        console.log("error catched: ", err);
        return {
            result: err,
            payload: signature
        };
    } finally {
        res = await new Promise((resolve, reject) => {
            PAEW_FreeContext.async(ppPAEWContext.deref(), (err, res) => {
                if (res == DLLRET.PAEW_RET_SUCCESS) {
                    resolve(res);
                } else {
                    reject(res);
                }
            });
        });
    }
};

const ETHTXSign = async (
    callbackFunc,
    callbackParam,
    derivePath,
    txData
) => {

    var sign = {};
    let ppPAEWContext = ref.alloc(voidPP);
    let pnDevCount = ref.alloc("size_t");
    let pDevInfo = ref.alloc(PAEW_DevInfo);
    let devInfo = pDevInfo.deref();

    let puiDerivePath = uint32Array(derivePath);
    let nDerivePathLen = derivePath.length;

    let pbCurrentTX = txData;
    let nCurrentTXLen = pbCurrentTX.length;
    let pbTXSig = new Buffer(DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let pnTXSigLen = ref.alloc("size_t", DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let res = 0;

    try {
        res = await new Promise((resolve, reject) => {
            PAEW_InitContext.async(
                ppPAEWContext,
                pnDevCount,
                callbackFunc,
                callbackParam.ref(),
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_InitContext fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_GetDevInfo.async(
                ppPAEWContext.deref(),
                0,
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_TYPE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_CHAIN_TYPE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SN +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_VERSION +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LIFECYCLE,
                pDevInfo,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_GetDevInfo fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_DeriveTradeAddress.async(
                ppPAEWContext.deref(),
                0,
                DLLCOINTYPE.PAEW_COIN_TYPE_ETH,
                puiDerivePath,
                nDerivePathLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_DeriveTradeAddress fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_ETH_TXSign.async(
                ppPAEWContext.deref(),
                0,
                pbCurrentTX,
                nCurrentTXLen,
                pbTXSig,
                pnTXSigLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        console.log("PAEW_ETH_TXSign completed");
                        resolve(res);
                    } else {
                        console.log("PAEW_ETH_TXSign fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        if (res == DLLRET.PAEW_RET_SUCCESS) {
            sign['raw'] = toHex(pbTXSig, pnTXSigLen.deref());
            sign['r'] = '0x' + sign['raw'].slice(0, 64);
            sign['s'] = '0x' + sign['raw'].slice(64, 128);
            sign['v'] = '0x' + sign['raw'].slice(128);
        }
        return {
            result: 0,
            payload: sign
        };
    } catch (err) {
        console.log("error catched: ", err);
        return {
            result: err,
            payload: sign
        };
    } finally {
        res = await new Promise((resolve, reject) => {
            PAEW_FreeContext.async(ppPAEWContext.deref(), (err, res) => {
                if (res == DLLRET.PAEW_RET_SUCCESS) {
                    resolve(res);
                } else {
                    reject(res);
                }
            });
        });
    }
};

const BTCTXSign = async (
    callbackFunc,
    callbackParam,
    derivePath,
    utxos,
    txData
) => {
    var signature = "";
    let ppPAEWContext = ref.alloc(voidPP);
    let pnDevCount = ref.alloc("size_t");
    let pDevInfo = ref.alloc(PAEW_DevInfo);
    let devInfo = pDevInfo.deref();

    let puiDerivePath = uint32Array(derivePath);
    let nDerivePathLen = derivePath.length;

    var nUTXOCount = utxos.length
    var pnUTXOLen = []
    var ppbUTXOs = strArray(nUTXOCount)
    var ppbTXSigArray = []
    var pnTXSigLenArray = []
    utxos.forEach(function (value, index) {
        let pbUTXO = ucharArray(value)
        ppbUTXOs[index] = pbUTXO
        pnUTXOLen.push(value.length)
        var ppbTXSig = ucharArray(DLLCONST.PAEW_BTC_SIG_MAX_LEN)
        ppbTXSigArray.push(ppbTXSig)
        pnTXSigLenArray.push(DLLCONST.PAEW_BTC_SIG_MAX_LEN)
    })
    var ppbTXSigs = strArray(ppbTXSigArray)
    var pnTXSigLen = uint64Array(pnTXSigLenArray)
    var pbCurrentTX = txData
    var pbCurrentTXLen = pbCurrentTX.length

    try {
        res = await new Promise((resolve, reject) => {
            PAEW_InitContext.async(
                ppPAEWContext,
                pnDevCount,
                callbackFunc,
                callbackParam.ref(),
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_InitContext fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_GetDevInfo.async(
                ppPAEWContext.deref(),
                0,
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_TYPE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_CHAIN_TYPE +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SN +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_VERSION +
                DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LIFECYCLE,
                pDevInfo,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_GetDevInfo fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        res = await new Promise((resolve, reject) => {
            PAEW_DeriveTradeAddress.async(
                ppPAEWContext.deref(),
                0,
                DLLCOINTYPE.PAEW_COIN_TYPE_BTC,
                puiDerivePath,
                nDerivePathLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_DeriveTradeAddress fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                        reject(res);
                    }
                }
            );
        });

        var strSigns = []
 
        res = await new Promise((resolve, reject) => {
            PAEW_BTC_TXSign.async(ppPAEWContext.deref(), 0, nUTXOCount, ppbUTXOs, pnUTXOLen, pbCurrentTX, pbCurrentTXLen, ppbTXSigs, pnTXSigLen, (err, res) => {
                if (res == DLLRET.PAEW_RET_SUCCESS) {
                    console.log("PAEW_BTC_TXSign completed");
                    var strs = [];
                    for (var i = 0; i < nUTXOCount; i++) {
                        const strSign = toHex(ppbTXSigs[i], pnTXSigLen[i])
                        strs.push(strSign)
                    }
                    strSigns = strs;
                    resolve(res);
                } else {
                    console.log("PAEW_BTC_TXSign fails, res is:", DLLUTIL.ewallet_ret2string(res), " , err is:", err);
                    reject(res);
                }
            });
        });
        return {
            result: res,
            payload: strSigns
        };

    } catch (err) {
        console.log("error catched: ", err);
        return {
            result: res,
            payload: signature
        };
    } finally {
        res = await new Promise((resolve, reject) => {
            PAEW_FreeContext.async(ppPAEWContext.deref(), (err, res) => {
                if (res == DLLRET.PAEW_RET_SUCCESS) {
                    resolve(res);
                } else {
                    reject(res);
                }
            });
        });
    }
};

const eosSignTest = async () => {
    await CheckDeviceState();
    let unsignedData = ucharArray([(0x74), (0x09), (0x70), (0xd9), (0xff),
        (0x01), (0xb5), (0x04), (0x63), (0x2f),
        (0xed), (0xe1), (0xad), (0xc3), (0xdf),
        (0xe5), (0x59), (0x90), (0x41), (0x5e),
        (0x4f), (0xde), (0x01), (0xe1), (0xb8),
        (0xf3), (0x15), (0xf8), (0x13), (0x6f),
        (0x47), (0x6c), (0x14), (0xc2), (0x67),
        (0x5b), (0x01), (0x24), (0x5f), (0x70),
        (0x5d), (0xd7), (0x00), (0x00), (0x00),
        (0x00), (0x01), (0x00), (0xa6), (0x82),
        (0x34), (0x03), (0xea), (0x30), (0x55),
        (0x00), (0x00), (0x00), (0x57), (0x2d),
        (0x3c), (0xcd), (0xcd), (0x01), (0x20),
        (0x29), (0xc2), (0xca), (0x55), (0x7a),
        (0x73), (0x57), (0x00), (0x00), (0x00),
        (0x00), (0xa8), (0xed), (0x32), (0x32),
        (0x21), (0x20), (0x29), (0xc2), (0xca),
        (0x55), (0x7a), (0x73), (0x57), (0x90),
        (0x55), (0x8c), (0x86), (0x77), (0x95),
        (0x4c), (0x3c), (0x10), (0x27), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x04), (0x45), (0x4f), (0x53), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00), (0x00), (0x00), (0x00),
        (0x00), (0x00)
    ])
    let txSig = await EOSTXSign(
        callbackFunc,
        callbackParam,
        [...wallet_conf.eos.derivePathPrefix, 0],
        new Buffer(unsignedData)
    );
    if (txSig.result != DLLRET.PAEW_RET_SUCCESS) {
        return {
            result: txSig.result,
            payload: null
        };
    }
    console.log(txSig);
}

const ethSignTest = async () => {
    await CheckDeviceState();
    let unsignedData = ucharArray([0xec, 0x09, 0x85, 0x04, 0xa8,
        0x17, 0xc8, 0x00, 0x82, 0x52,
        0x08, 0x94, 0x35, 0x35, 0x35,
        0x35, 0x35, 0x35, 0x35, 0x35,
        0x35, 0x35, 0x35, 0x35, 0x35,
        0x35, 0x35, 0x35, 0x35, 0x35,
        0x35, 0x35, 0x88, 0x0d, 0xe0,
        0xb6, 0xb3, 0xa7, 0x64, 0x00,
        0x00, 0x80, 0x01, 0x80, 0x80
    ])
    let txSig = await ETHTXSign(
        callbackFunc,
        callbackParam,
        [...wallet_conf.eth.derivePathPrefix, 0],
        new Buffer(unsignedData)
    );
    if (txSig.result != DLLRET.PAEW_RET_SUCCESS) {
        return {
            result: txSig.result,
            payload: null
        };
    }
    console.log(txSig);
}

const btcSignTest = async () => {
    await CheckDeviceState();
    let pbUTXO1 = ([0x01, 0x00, 0x00, 0x00, 0x03, 0xe0, 0xb1, 0x1a, 0x95, 0x15, 0xee, 0x6d, 0x6b, 0x54, 0x08, 0xaf, 0x88, 0x1d, 0x6e, 0x44, 0x75, 0xdd, 0xbd, 0x4f, 0x4c, 0xab, 0xcf, 0xfa, 0x73, 0x00, 0xfc, 0x95, 0x36, 0x7f, 0xe5, 0x3f, 0xd0, 0x01, 0x00, 0x00, 0x00, 0x6b, 0x48, 0x30, 0x45, 0x02, 0x21, 0x00, 0xd7, 0xe8, 0x36, 0x51, 0x9e, 0x2b, 0x08, 0x5c, 0xae, 0x1c, 0xe9, 0xc4, 0xee, 0x45, 0x66, 0xe1, 0x4c, 0x31, 0xcf, 0x27, 0x6e, 0xbc, 0x78, 0xd4, 0x5b, 0x86, 0x55, 0xf8, 0x4f, 0x76, 0x3e, 0x5c, 0x02, 0x20, 0x4f, 0xb4, 0x83, 0xa7, 0xa4, 0xe5, 0xf1, 0x00, 0xcb, 0xcd, 0xd2, 0x23, 0xf3, 0xc2, 0x18, 0x20, 0xd9, 0xe8, 0xc9, 0xf6, 0xa6, 0x7f, 0x2b, 0x06, 0xbd, 0x52, 0xde, 0xf4, 0x66, 0x34, 0xba, 0xd9, 0x01, 0x21, 0x03, 0x95, 0xe0, 0x57, 0x1b, 0x44, 0x1e, 0x0f, 0x2f, 0xd9, 0x32, 0x90, 0x6a, 0x3f, 0xd6, 0x8a, 0x57, 0x09, 0x8a, 0x55, 0x52, 0xdd, 0x62, 0xe2, 0x23, 0x87, 0x13, 0x9b, 0x1f, 0x60, 0x78, 0x22, 0x3d, 0xff, 0xff, 0xff, 0xff, 0xe0, 0xb1, 0x1a, 0x95, 0x15, 0xee, 0x6d, 0x6b, 0x54, 0x08, 0xaf, 0x88, 0x1d, 0x6e, 0x44, 0x75, 0xdd, 0xbd, 0x4f, 0x4c, 0xab, 0xcf, 0xfa, 0x73, 0x00, 0xfc, 0x95, 0x36, 0x7f, 0xe5, 0x3f, 0xd0, 0x00, 0x00, 0x00, 0x00, 0x6a, 0x47, 0x30, 0x44, 0x02, 0x20, 0x5e, 0xfa, 0x77, 0x19, 0xce, 0x8d, 0xb5, 0x45, 0x4c, 0x55, 0xc2, 0x1a, 0x97, 0xe8, 0x9e, 0xce, 0xe2, 0x0e, 0x16, 0x7b, 0x84, 0x81, 0x63, 0x22, 0x5a, 0x30, 0xb6, 0x30, 0xb2, 0xab, 0xb8, 0x70, 0x02, 0x20, 0x12, 0xa2, 0x4d, 0xf9, 0xf0, 0xc7, 0x64, 0x84, 0x3b, 0x8e, 0xe5, 0x8a, 0x56, 0x63, 0x2f, 0xc8, 0x4b, 0xda, 0x23, 0xcc, 0xf7, 0xa7, 0x4c, 0xad, 0xe9, 0x45, 0xe7, 0xc1, 0x67, 0x96, 0xa4, 0x27, 0x01, 0x21, 0x03, 0x95, 0xe0, 0x57, 0x1b, 0x44, 0x1e, 0x0f, 0x2f, 0xd9, 0x32, 0x90, 0x6a, 0x3f, 0xd6, 0x8a, 0x57, 0x09, 0x8a, 0x55, 0x52, 0xdd, 0x62, 0xe2, 0x23, 0x87, 0x13, 0x9b, 0x1f, 0x60, 0x78, 0x22, 0x3d, 0xff, 0xff, 0xff, 0xff, 0x09, 0xfb, 0x2c, 0xc0, 0xa8, 0x73, 0x80, 0x0b, 0x67, 0xfb, 0x14, 0x39, 0x83, 0xf6, 0x6d, 0x7a, 0x02, 0xa6, 0xfb, 0x74, 0x02, 0x35, 0x6c, 0x64, 0x24, 0x67, 0x20, 0xf3, 0x1f, 0xb9, 0xee, 0xaf, 0x01, 0x00, 0x00, 0x00, 0x6a, 0x47, 0x30, 0x44, 0x02, 0x20, 0x25, 0xdd, 0xa0, 0xab, 0x18, 0x22, 0xb2, 0x87, 0x84, 0x96, 0x11, 0x6b, 0x36, 0xdb, 0x23, 0x9a, 0xeb, 0x98, 0x27, 0x60, 0xa8, 0x60, 0x39, 0xfd, 0xd5, 0xc3, 0x71, 0x34, 0x13, 0x78, 0x76, 0x38, 0x02, 0x20, 0x64, 0x60, 0xf3, 0x5b, 0x32, 0xa2, 0x92, 0xd2, 0x04, 0x73, 0xa8, 0x67, 0x73, 0x50, 0x68, 0xc1, 0xcf, 0xf3, 0xf0, 0x06, 0xeb, 0x27, 0xa1, 0x59, 0x22, 0xd3, 0xb7, 0x23, 0xce, 0x92, 0xfb, 0x54, 0x01, 0x21, 0x03, 0x95, 0xe0, 0x57, 0x1b, 0x44, 0x1e, 0x0f, 0x2f, 0xd9, 0x32, 0x90, 0x6a, 0x3f, 0xd6, 0x8a, 0x57, 0x09, 0x8a, 0x55, 0x52, 0xdd, 0x62, 0xe2, 0x23, 0x87, 0x13, 0x9b, 0x1f, 0x60, 0x78, 0x22, 0x3d, 0xff, 0xff, 0xff, 0xff, 0x02, 0x00, 0x46, 0xc3, 0x23, 0x00, 0x00, 0x00, 0x00, 0x19, 0x76, 0xa9, 0x14, 0xcd, 0x55, 0x7a, 0x2e, 0x83, 0xfb, 0x75, 0x18, 0x50, 0x73, 0xa3, 0x01, 0xda, 0x77, 0x28, 0x85, 0x18, 0x3b, 0x58, 0x0c, 0x88, 0xac, 0x11, 0x39, 0xc0, 0x05, 0x00, 0x00, 0x00, 0x00, 0x19, 0x76, 0xa9, 0x14, 0xcd, 0x55, 0x7a, 0x2e, 0x83, 0xfb, 0x75, 0x18, 0x50, 0x73, 0xa3, 0x01, 0xda, 0x77, 0x28, 0x85, 0x18, 0x3b, 0x58, 0x0c, 0x88, 0xac, 0x00, 0x00, 0x00, 0x00]);
	let pbUTXO2 = ([0x01, 0x00, 0x00, 0x00, 0x01, 0xde, 0xe0, 0x79, 0x35, 0x92, 0x48, 0x29, 0x9e, 0x3f, 0x24, 0xe7, 0x87, 0x7c, 0x6b, 0x1c, 0x2f, 0x36, 0x1b, 0x54, 0x74, 0x1f, 0x00, 0xb8, 0x05, 0x6f, 0xc5, 0x00, 0x1c, 0xdc, 0x75, 0x07, 0x94, 0x00, 0x00, 0x00, 0x00, 0x6a, 0x47, 0x30, 0x44, 0x02, 0x20, 0x0d, 0xbb, 0xca, 0x48, 0x74, 0xb8, 0x36, 0x23, 0xea, 0x6c, 0x31, 0x97, 0x0d, 0xf4, 0x9e, 0xfb, 0xc3, 0x71, 0xc1, 0x20, 0xa9, 0x33, 0xea, 0x7f, 0x5a, 0xd7, 0x07, 0xf7, 0xa0, 0xbc, 0x57, 0xab, 0x02, 0x20, 0x7c, 0xd3, 0x14, 0x05, 0xcb, 0xcb, 0x55, 0x20, 0xe6, 0x35, 0x07, 0x9f, 0x1b, 0x8a, 0x8b, 0xde, 0xc9, 0xe7, 0xea, 0x6c, 0x5a, 0xa5, 0x99, 0x7e, 0xa1, 0xee, 0x65, 0x9e, 0xe4, 0xef, 0xdd, 0x77, 0x01, 0x21, 0x03, 0x95, 0xe0, 0x57, 0x1b, 0x44, 0x1e, 0x0f, 0x2f, 0xd9, 0x32, 0x90, 0x6a, 0x3f, 0xd6, 0x8a, 0x57, 0x09, 0x8a, 0x55, 0x52, 0xdd, 0x62, 0xe2, 0x23, 0x87, 0x13, 0x9b, 0x1f, 0x60, 0x78, 0x22, 0x3d, 0xff, 0xff, 0xff, 0xff, 0x02, 0x00, 0x46, 0xc3, 0x23, 0x00, 0x00, 0x00, 0x00, 0x19, 0x76, 0xa9, 0x14, 0xcd, 0x55, 0x7a, 0x2e, 0x83, 0xfb, 0x75, 0x18, 0x50, 0x73, 0xa3, 0x01, 0xda, 0x77, 0x28, 0x85, 0x18, 0x3b, 0x58, 0x0c, 0x88, 0xac, 0x60, 0xb9, 0xeb, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x19, 0x76, 0xa9, 0x14, 0xcd, 0x55, 0x7a, 0x2e, 0x83, 0xfb, 0x75, 0x18, 0x50, 0x73, 0xa3, 0x01, 0xda, 0x77, 0x28, 0x85, 0x18, 0x3b, 0x58, 0x0c, 0x88, 0xac, 0x00, 0x00, 0x00, 0x00]);
	let utxos = [pbUTXO1, pbUTXO2];

	let pbCurrentTX = ucharArray([0x01, 0x00, 0x00, 0x00, 0x02, 0xbf, 0x69, 0x08, 0x9d, 0x98, 0xb9, 0x3c, 0xd3, 0xe5, 0x4f, 0xb2, 0xcc, 0x45, 0x75, 0xde, 0x55, 0x0f, 0xa4, 0x6b, 0x49, 0x01, 0xc8, 0xd3, 0xf5, 0x9c, 0xa3, 0x18, 0xfc, 0x63, 0xe0, 0x02, 0x77, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xcd, 0x6e, 0x85, 0xa4, 0xe5, 0x33, 0xf5, 0x6f, 0x65, 0x8b, 0x80, 0xb1, 0x9d, 0xee, 0x11, 0x4f, 0x0b, 0xc4, 0xb0, 0xc7, 0x80, 0xeb, 0x68, 0x3b, 0x59, 0x22, 0x1c, 0x6f, 0xe1, 0x81, 0xd3, 0x57, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x02, 0x00, 0xca, 0x9a, 0x3b, 0x00, 0x00, 0x00, 0x00, 0x19, 0x76, 0xa9, 0x14, 0xcd, 0x55, 0x7a, 0x2e, 0x83, 0xfb, 0x75, 0x18, 0x50, 0x73, 0xa3, 0x01, 0xda, 0x77, 0x28, 0x85, 0x18, 0x3b, 0x58, 0x0c, 0x88, 0xac, 0xbb, 0xb3, 0xeb, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x19, 0x76, 0xa9, 0x14, 0xcd, 0x55, 0x7a, 0x2e, 0x83, 0xfb, 0x75, 0x18, 0x50, 0x73, 0xa3, 0x01, 0xda, 0x77, 0x28, 0x85, 0x18, 0x3b, 0x58, 0x0c, 0x88, 0xac, 0x00, 0x00, 0x00, 0x00]);

    let txSig = await BTCTXSign(
        callbackFunc,
        callbackParam,
        [...wallet_conf.btc.derivePathPrefix, 0],
        utxos,
        new Buffer(pbCurrentTX)
    );
    if (txSig.result != DLLRET.PAEW_RET_SUCCESS) {
        return {
            result: txSig.result,
            payload: null
        };
    }
    console.log(txSig);


}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


const test = async () => {
    await eosSignTest();
    await ethSignTest();
    await btcSignTest();
}

test();