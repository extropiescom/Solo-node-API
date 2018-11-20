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
    ucharArray
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
    PAEW_CYB_TXSign
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
            /*
            const nAddressDataLen = ref
                .alloc(
                    ref.refType("size_t"),
                    cbparam.data.buffer.slice(
                        ref.types.uchar.size,
                        ref.types.uchar.size + ref.types.size_t.size
                    )
                )
                .deref()
                .deref();
            */
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



const EOSTXSign = async (
    szDevName,
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

    let pbTradeAddress = new Buffer(DLLCONST.PAEW_COIN_ADDRESS_MAX_LEN);
    let pnTradeAddressLen = ref.alloc("size_t", DLLCONST.PAEW_COIN_ADDRESS_MAX_LEN);

    let pbCurrentTX = txData;
    let nCurrentTXLen = pbCurrentTX.length;
    let pbTXSig = new Buffer(DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let pnTXSigLen = ref.alloc("size_t", DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let res = 0;

    try {
        if (szDevName != undefined) {
            res = await new Promise((resolve, reject) => {
                PAEW_InitContextWithDevName.async(
                    ppPAEWContext,
                    szDevName,
                    DLLDEVTYPE.PAEW_DEV_TYPE_HID,
                    callbackFunc,
                    callbackParam.ref(),
                    (err, res) => {
                        if (res == DLLRET.PAEW_RET_SUCCESS) {
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    }
                );
            });
        } else {
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
                            reject(res);
                        }
                    }
                );
            });
            console.log("PAEW_InitContext, res is:", res)
        }

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
                        reject(res);
                    }
                }
            );
        });

        console.log("PAEW_GetDevInfo, res is:", res)
        if (
            devInfo.ucCOSType ==
            DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_DRAGONBALL
        ) {
            res = await new Promise((resolve, reject) => {
                PAEW_GetDevInfo.async(
                    ppPAEWContext.deref(),
                    0,
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_TYPE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_CHAIN_TYPE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SN +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_VERSION +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LIFECYCLE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_N_T +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SESSKEY_HASH,
                    pDevInfo,
                    (err, res) => {
                        if (res == DLLRET.PAEW_RET_SUCCESS) {
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    }
                );
            });
        }

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
                        reject(res);
                    }
                }
            );
        });
        console.log("PAEW_DeriveTradeAddress, res is:", res)

        res = await new Promise((resolve, reject) => {
            PAEW_GetTradeAddress.async(
                ppPAEWContext.deref(),
                0,
                DLLCOINTYPE.PAEW_COIN_TYPE_EOS,
                0,
                pbTradeAddress,
                pnTradeAddressLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_GetTradeAddress fails, res is:", res, " , err is:", err)
                        reject(res);
                    }
                }
            );
        });

        console.log("PAEW_GetTradeAddress, res is:", res)
        console.log("currentTX:", pbCurrentTX);
        console.log("nCurrentTXLen:", nCurrentTXLen);


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
                        console.log("PAEW_EOS_TXSign completed")
                        resolve(res);
                    } else {
                        console.log("PAEW_EOS_TXSign fails, res is:", res, " , err is:", err)
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

        console.log("PAEW_FreeContext, res is:", res)
    }
};

const ETHTXSign = async (
    szDevName,
    callbackFunc,
    callbackParam,
    derivePath,
    erc20,
    decimal,
    txData
) => {

    var sign = {};
    let ppPAEWContext = ref.alloc(voidPP);
    let pnDevCount = ref.alloc("size_t");
    let pDevInfo = ref.alloc(PAEW_DevInfo);
    let devInfo = pDevInfo.deref();

    let puiDerivePath = uint32Array(derivePath);
    let nDerivePathLen = derivePath.length;

    let pbTradeAddress = new Buffer(DLLCONST.PAEW_COIN_ADDRESS_MAX_LEN);
    let pnTradeAddressLen = ref.alloc("size_t", DLLCONST.PAEW_COIN_ADDRESS_MAX_LEN);

    let pbCurrentTX = txData;
    let nCurrentTXLen = pbCurrentTX.length;
    let pbTXSig = new Buffer(DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let pnTXSigLen = ref.alloc("size_t", DLLCONST.PAEW_EOS_SIG_MAX_LEN);
    let res = 0;

    try {
        if (szDevName != undefined) {
            res = await new Promise((resolve, reject) => {
                PAEW_InitContextWithDevName.async(
                    ppPAEWContext,
                    szDevName,
                    DLLDEVTYPE.PAEW_DEV_TYPE_HID,
                    callbackFunc,
                    callbackParam.ref(),
                    (err, res) => {
                        if (res == DLLRET.PAEW_RET_SUCCESS) {
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    }
                );
            });
        } else {
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
                            reject(res);
                        }
                    }
                );
            });
            console.log("PAEW_InitContext, res is:", res)
        }

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
                        reject(res);
                    }
                }
            );
        });

        console.log("PAEW_GetDevInfo, res is:", res)
        if (
            devInfo.ucCOSType ==
            DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_DRAGONBALL
        ) {
            res = await new Promise((resolve, reject) => {
                PAEW_GetDevInfo.async(
                    ppPAEWContext.deref(),
                    0,
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_TYPE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_CHAIN_TYPE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SN +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_VERSION +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LIFECYCLE +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_N_T +
                    DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SESSKEY_HASH,
                    pDevInfo,
                    (err, res) => {
                        if (res == DLLRET.PAEW_RET_SUCCESS) {
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    }
                );
            });
        }

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
                        reject(res);
                    }
                }
            );
        });
        console.log("PAEW_DeriveTradeAddress, res is:", res)

        res = await new Promise((resolve, reject) => {
            PAEW_GetTradeAddress.async(
                ppPAEWContext.deref(),
                0,
                DLLCOINTYPE.PAEW_COIN_TYPE_ETH,
                0,
                pbTradeAddress,
                pnTradeAddressLen,
                (err, res) => {
                    if (res == DLLRET.PAEW_RET_SUCCESS) {
                        resolve(res);
                    } else {
                        console.log("PAEW_GetTradeAddress fails, res is:", res, " , err is:", err)
                        reject(res);
                    }
                }
            );
        });

        console.log("PAEW_GetTradeAddress, res is:", res)
        console.log("currentTX:", pbCurrentTX);
        console.log("nCurrentTXLen:", nCurrentTXLen);

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
                        console.log("PAEW_ETH_TXSign completed")
                        resolve(res);
                    } else {
                        console.log("PAEW_ETH_TXSign fails, res is:", res, " , err is:", err)
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
            console.log("raw sig: ", sign['raw']);
            console.log("r: ", sign['r']);
            console.log("s: ", sign['s']);
            console.log("v: ", sign['v']);
        }
        return {
            result: 0,
            payload: sign
        };
    } catch (err) {
        //throw { result: err, payload: null };
        console.log("error catched: ", err);
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

        console.log("PAEW_FreeContext, res is:", res)
    }
};

const eosSignTest = async () => {
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
    console.log("test2222");
    let txSig = await EOSTXSign(
        null,
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
    console.log("test2222");
    let txSig = await ETHTXSign(
        null,
        callbackFunc,
        callbackParam,
        [...wallet_conf.eth.derivePathPrefix, 0],
        null,
        18,
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

const test = async () => {
    await eosSignTest();
    await ethSignTest();
}

test();