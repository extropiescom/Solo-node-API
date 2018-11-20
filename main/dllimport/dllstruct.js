const ref = require("ref");
const Struct = require("ref-struct");
const Array = require("ref-array");
const { DLLCONST, DLLDEVINFO } = require("./dllconst");

//struct
let { PAEW_CALLBACK_DATA_MAX_LEN } = DLLCONST;
let { PAEW_DEV_INFO_SN_LEN } = DLLDEVINFO.SN;
let { PAEW_DEV_INFO_COS_VERSION_LEN } = DLLDEVINFO.COSVERSION;
let { PAEW_DEV_INFO_SESSKEY_HASH_LEN } = DLLDEVINFO.SESSKEYHASH;

//Types
const DLLTYPE = {};
DLLTYPE.uint32Array = Array("uint32");
DLLTYPE.ucharArray = Array("uchar");
DLLTYPE.voidPP = ref.refType(ref.refType(ref.types.void));
/*
typedef struct _callback_data_addr_get
{
	unsigned char	nCoinType;
	size_t			nAddressLen;
	unsigned char	pbAddressData[PAEW_CALLBACK_DATA_MAX_LEN - sizeof(size_t) - 1];
} callback_data_addr_get;
*/
const CallbackDataAddrGet = Struct({
    nCoinType: "uchar",
    nAddressLen: "size_t",
    pbAddressData: Array(
        "uchar",
        PAEW_CALLBACK_DATA_MAX_LEN -
            ref.types.size_t.size -
            ref.types.uchar.size
    )
});
/*
typedef struct _callback_data_cos_update
{
	uint32_t		nProgress;
	unsigned char	pbUnused[PAEW_CALLBACK_DATA_MAX_LEN - sizeof(uint32_t)];
} callback_data_cos_update;
*/
const CallbackDataCOSUpdate = Struct({
    nProgress: "uint32",
    pbUnused: Array("uchar", PAEW_CALLBACK_DATA_MAX_LEN - ref.types.uint32.size)
});
/*
typedef struct _callback_param
{
	process_step	pstep;
	process_status	pstatus;
	int				ret_value; //when pstatus==pstatus_finish, check this value

	size_t			dev_index; //current main device index, from 0 to dev_count-1, not valid in pstep_comm_enum_dev

	//user define data
	size_t			dev_count; //valid in pstep_comm_enum_dev

	unsigned char	data[PAEW_CALLBACK_DATA_MAX_LEN]; //store addr or other informations
} callback_param;
*/
const CallbackParam = Struct({
    pstep: "int",
    pstatus: "int",
    ret_value: "int",
    dev_index: "size_t",
    dev_count: "size_t",
    data: Array("uchar", PAEW_CALLBACK_DATA_MAX_LEN)
});

/*
typedef struct _PAEW_DevInfo
{
	unsigned char	ucPINState; //PAEW_DEV_INFO_PIN_XX
	unsigned char	ucCOSType; //PAEW_DEV_INFO_COS_TYPE_XXX
	unsigned char	ucChainType; //PAEW_DEV_INFO_CHAIN_TYPE_XXX
	unsigned char	pbSerialNumber[PAEW_DEV_INFO_SN_LEN];
	unsigned char	pbCOSVersion[PAEW_DEV_INFO_COS_VERSION_LEN];
    unsigned char	ucLifeCycle; // PAEW_DEV_INFO_LIFECYCLE_XXX
    uint64_t		nLcdState; // PAEW_DEV_INFO_LCD_XXX

	//dragon ball device info
	unsigned char	pbSessKeyHash[PAEW_DEV_INFO_SESSKEY_HASH_LEN];
	uint8_t			nN;
	uint8_t			nT;
} PAEW_DevInfo;
*/
const PAEW_DevInfo = Struct({
    ucPINState: "uchar",
    ucCOSType: "uchar",
    ucChainType: "uchar",

    pbSerialNumber: Array("uchar", PAEW_DEV_INFO_SN_LEN),
    pbCOSVersion: Array("uchar", PAEW_DEV_INFO_COS_VERSION_LEN),
    ucLifeCycle: "uchar",
    nLcdState: "uint64",

    pbSessKeyHash: Array("uchar", PAEW_DEV_INFO_SESSKEY_HASH_LEN),
    nN: "uint8",
    nT: "uint8"
});

module.exports = {
    DLLTYPE,
    CallbackDataAddrGet,
    CallbackDataCOSUpdate,
    CallbackParam,
    PAEW_DevInfo
};
