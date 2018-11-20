const DLLRET = {};
//return values
DLLRET.PAEW_RET_SUCCESS = 0x00000000; //success
DLLRET.PAEW_RET_UNKNOWN_FAIL = 0x80000001; //unknown failure
DLLRET.PAEW_RET_ARGUMENTBAD = 0x80000002; //argument bad
DLLRET.PAEW_RET_HOST_MEMORY = 0x80000003; //malloc memory failed

DLLRET.PAEW_RET_DEV_ENUM_FAIL = 0x80000004; //enum device failed
DLLRET.PAEW_RET_DEV_OPEN_FAIL = 0x80000005; //open device failed
DLLRET.PAEW_RET_DEV_COMMUNICATE_FAIL = 0x80000006; //communicate failed
DLLRET.PAEW_RET_DEV_NEED_PIN = 0x80000007; //device need user input pin to "unlock"
DLLRET.PAEW_RET_DEV_OP_CANCEL = 0x80000008; //operation canceled
DLLRET.PAEW_RET_DEV_KEY_NOT_RESTORED = 0x80000009; //operation need seed restored while current state is not restored
DLLRET.PAEW_RET_DEV_KEY_ALREADY_RESTORED = 0x8000000a; //seed already restored
DLLRET.PAEW_RET_DEV_COUNT_BAD = 0x8000000b; //errors such as no device, or device count must equal to N when init, device count must >=T and <=N when restore or sign
DLLRET.PAEW_RET_DEV_RETDATA_INVALID = 0x8000000c; //received data length less than 2 or ret data structure invalid
DLLRET.PAEW_RET_DEV_AUTH_FAIL = 0x8000000d;
DLLRET.PAEW_RET_DEV_STATE_INVALID = 0x8000000e; //life cycle or other device state not matched to current operation
DLLRET.PAEW_RET_DEV_WAITING = 0x8000000f;
DLLRET.PAEW_RET_DEV_COMMAND_INVALID = 0x80000010; //command can not recognized by device
DLLRET.PAEW_RET_DEV_RUN_COMMAND_FAIL = 0x80000011; //received data not 9000
DLLRET.PAEW_RET_DEV_HANDLE_INVALID = 0x80000012;
DLLRET.PAEW_RET_COS_TYPE_INVALID = 0x80000013; //device cos type value must be PAEW_DEV_INFO_COS_TYPE_XXX
DLLRET.PAEW_RET_COS_TYPE_NOT_MATCH = 0x80000014; //device cos type not matched to current operation, such as dragon ball spec function calls personal e-wallet, or passed argument implies specific cos type while current cos type not match, or current insert devices' types are not the same
DLLRET.PAEW_RET_DEV_BAD_SHAMIR_SPLIT = 0x80000015;
DLLRET.PAEW_RET_DEV_NOT_ONE_GROUP = 0x80000016; //dragon ball device is not belong to one group

DLLRET.PAEW_RET_BUFFER_TOO_SAMLL = 0x80000017; //size of input buffer not enough to store return data
DLLRET.PAEW_RET_TX_PARSE_FAIL = 0x80000018; //input transaction parse failed
DLLRET.PAEW_RET_TX_UTXO_NEQ = 0x80000019; //count of input and UTXO is not equal
DLLRET.PAEW_RET_TX_INPUT_TOO_MANY = 0x8000001a; //input count shouldn't larger than 100

DLLRET.PAEW_RET_MUTEX_ERROR = 0x8000001b; //mutex error, such as create/free/lock/unlock
DLLRET.PAEW_RET_COIN_TYPE_INVALID = 0x8000001c; //value of coin type must be PAEW_COIN_TYPE_XXX
DLLRET.PAEW_RET_COIN_TYPE_NOT_MATCH = 0x8000001d; //value of coin type must be equal to the value passed to PAEW_DeriveTradeAddress
DLLRET.PAEW_RET_DERIVE_PATH_INVALID = 0x8000001e; //derive path must start by 0x00000000, indicates m
DLLRET.PAEW_RET_NOT_SUPPORTED = 0x8000001f;
DLLRET.PAEW_RET_INTERNAL_ERROR = 0x80000020; //library internal errors, such as internal structure definition mistake
DLLRET.PAEW_RET_BAD_N_T = 0x80000021; //value of N or T is invalid
DLLRET.PAEW_RET_TARGET_DEV_INVALID = 0x80000022; //when getting address or signing, dragon ball must select a target device by calling PAEW_DeriveTradeAddress successfully first
DLLRET.PAEW_RET_CRYPTO_ERROR = 0x80000023;
DLLRET.PAEW_RET_DEV_TIMEOUT = 0x80000024; //device time out
DLLRET.PAEW_RET_DEV_PIN_LOCKED = 0x80000025; //pin locked
DLLRET.PAEW_RET_DEV_PIN_CONFIRM_FAIL = 0x80000026; //set new pin error when confirm
DLLRET.PAEW_RET_DEV_PIN_VERIFY_FAIL = 0x80000027; //input pin error when change pin or other operation

DLLRET.PAEW_RET_DEV_CHECKDATA_FAIL = 0x80000028; //input data check failed in device
DLLRET.PAEW_RET_DEV_DEV_OPERATING = 0x80000029; //user is operating device, please wait
DLLRET.PAEW_RET_DEV_PIN_UNINIT = 0x8000002a;
DLLRET.PAEW_RET_DEV_BUSY = 0x8000002b; //if enroll or verify fp is called twice when the first process is not over
DLLRET.PAEW_RET_DEV_ALREADY_AVAILABLE = 0x8000002c; //if abort when no operation is processing
DLLRET.PAEW_RET_DEV_DATA_NOT_FOUND = 0x8000002d;
DLLRET.PAEW_RET_DEV_SENSOR_ERROR = 0x8000002e;
DLLRET.PAEW_RET_DEV_STORAGE_ERROR = 0x8000002f;
DLLRET.PAEW_RET_DEV_STORAGE_FULL = 0x80000030;
DLLRET.PAEW_RET_DEV_FP_COMMON_ERROR = 0x80000031;
DLLRET.PAEW_RET_DEV_FP_REDUNDANT = 0x80000032;
DLLRET.PAEW_RET_DEV_FP_GOOG_FINGER = 0x80000033;
DLLRET.PAEW_RET_DEV_FP_NO_FINGER = 0x80000034;
DLLRET.PAEW_RET_DEV_FP_NOT_FULL_FINGER = 0x80000035;
DLLRET.PAEW_RET_DEV_FP_BAD_IMAGE = 0x80000036;
DLLRET.PAEW_RET_DEV_LOW_POWER = 0x80000037;
DLLRET.PAEW_RET_DEV_TYPE_INVALID = 0x80000038;

const DLLPSTEP = {};
//pstep
DLLPSTEP.pstep_invalid = 0;
DLLPSTEP.pstep_comm_enum_dev = 1;
DLLPSTEP.pstep_comm_open_dev = 2;
DLLPSTEP.pstep_comm_close_dev = 3;
DLLPSTEP.pstep_comm_get_devinfo = 4;
DLLPSTEP.pstep_comm_dev_select = 5;
DLLPSTEP.pstep_init_seed_gen = 6;
DLLPSTEP.pstep_init_mne_show = 7;
DLLPSTEP.pstep_init_mne_confirm = 8;
DLLPSTEP.pstep_init_seed_import = 9;
DLLPSTEP.pstep_init_seed_import_comfirm = 10;
DLLPSTEP.pstep_init_keypair_gen = 11;
DLLPSTEP.pstep_init_key_agree_init = 12;
DLLPSTEP.pstep_init_key_agree_update = 13;
DLLPSTEP.pstep_init_key_agree_final = 14;
DLLPSTEP.pstep_init_key_agree_show = 15;
DLLPSTEP.pstep_init_key_agree_confirm = 16;
DLLPSTEP.pstep_init_shamir_transmit_init = 17;
DLLPSTEP.pstep_init_shamir_export = 18;
DLLPSTEP.pstep_init_shamir_import = 19;
DLLPSTEP.pstep_init_shamir_confirm = 20;
DLLPSTEP.pstep_sig_output_data = 21;
DLLPSTEP.pstep_sig_confirm = 22;
DLLPSTEP.pstep_comm_addr_gen = 23;
DLLPSTEP.pstep_comm_shamir_transmit_init = 24;
DLLPSTEP.pstep_comm_shamir_export = 25;
DLLPSTEP.pstep_comm_shamir_import = 26;
DLLPSTEP.pstep_comm_addr_get = 27;
DLLPSTEP.pstep_comm_addr_confirm = 28;
DLLPSTEP.pstep_comm_format = 29;
DLLPSTEP.pstep_comm_format_confirm = 30;
DLLPSTEP.pstep_comm_clearcos = 31;
DLLPSTEP.pstep_comm_clearcos_confirm = 32;
DLLPSTEP.pstep_comm_updatecos = 33;
DLLPSTEP.pstep_comm_changepin = 34;
DLLPSTEP.pstep_comm_changepin_confirm = 35;
DLLPSTEP.pstep_comm_addr_info_get = 36;
DLLPSTEP.pstep_comm_addr_info_set = 37;
DLLPSTEP.pstep_comm_erc20_info_set = 38;
DLLPSTEP.pstep_init_mne_check = 39;
DLLPSTEP.pstep_init_pin_init = 40;
DLLPSTEP.pstep_comm_pin_verify = 41;
DLLPSTEP.pstep_comm_fp_getlist = 42;
DLLPSTEP.pstep_comm_fp_enroll = 43;
DLLPSTEP.pstep_comm_fp_verify = 44;
DLLPSTEP.pstep_comm_fp_getstate = 45;
DLLPSTEP.pstep_comm_fp_abort = 46;
DLLPSTEP.pstep_comm_fp_delete = 47;
DLLPSTEP.pstep_comm_fp_calibrate = 48;

//pstatus
const DLLPSTATUS = {};
DLLPSTATUS.pstatus_invalid = 0;
DLLPSTATUS.pstatus_start = 1;
DLLPSTATUS.pstatus_finish = 2;

//dev info
const DLLDEVINFO = {};

//dev info type
DLLDEVINFO.TYPE = {};
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_PIN_STATE = 0x00000001;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_TYPE = 0x00000002;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_CHAIN_TYPE = 0x00000004;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SN = 0x00000008;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_COS_VERSION = 0x00000010;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_LIFECYCLE = 0x00000020;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_SESSKEY_HASH = 0x00000040;
DLLDEVINFO.TYPE.PAEW_DEV_INFOTYPE_N_T = 0x00000080;
//pin state
DLLDEVINFO.PINSTATE = {};
DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_INVALID_STATE = 0xff;
DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOGOUT = 0x00;
DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOGIN = 0x01;
DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOCKED = 0x02;
DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_UNSET = 0x03;
//chain type
DLLDEVINFO.CHAINTYPE = {};
DLLDEVINFO.CHAINTYPE.PAEW_DEV_INFO_CHAIN_TYPE_FORMAL = 0x01;
DLLDEVINFO.CHAINTYPE.PAEW_DEV_INFO_CHAIN_TYPE_TEST = 0x02;
//sn
DLLDEVINFO.SN = {};
DLLDEVINFO.SN.PAEW_DEV_INFO_SN_LEN = 0x20;
//cos version
//1st byte means cos architecture, usually essential cos upgrade
//2nd byte means cos type, currently 00 dragon ball, 01 personal wallet
//3rd and 4th bytes means minor version
DLLDEVINFO.COSVERSION = {};
DLLDEVINFO.COSVERSION.PAEW_DEV_INFO_COS_VERSION_LEN = 0x04;
DLLDEVINFO.COSTYPE = {};
DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_INDEX = 0x01;
DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_INVALID = 0xff;
DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_DRAGONBALL = 0x00;
DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_PERSONAL = 0x01;
//life cycle
DLLDEVINFO.LIFECYCLE = {};
DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_INVALID = 0xff;
DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_AGREE = 0x01;
DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_USER = 0x02;
DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_PRODUCE = 0x04;
//session key hash
DLLDEVINFO.SESSKEYHASH = {};
DLLDEVINFO.SESSKEYHASH.PAEW_DEV_INFO_SESSKEY_HASH_LEN = 0x04;
//n/t
DLLDEVINFO.N_T = {};
DLLDEVINFO.N_T.PAEW_DEV_INFO_N_T_INVALID = 0xff;

//coin type
const DLLCOINTYPE = {};
DLLCOINTYPE.PAEW_COIN_TYPE_INVALID = 0xff;
DLLCOINTYPE.PAEW_COIN_TYPE_BTC = 0x00; //bit coin
DLLCOINTYPE.PAEW_COIN_TYPE_ETH = 0x01; //eth
DLLCOINTYPE.PAEW_COIN_TYPE_CYB = 0x02; //cybex
DLLCOINTYPE.PAEW_COIN_TYPE_EOS = 0x03; //eos
DLLCOINTYPE.PAEW_COIN_TYPE_LTC = 0x04; //lite
DLLCOINTYPE.PAEW_COIN_TYPE_NEO = 0x05; //neo

//device type
const DLLDEVTYPE = {};
DLLDEVTYPE.PAEW_DEV_TYPE_HID = 0x00;
DLLDEVTYPE.PAEW_DEV_TYPE_BT = 0x01;

//other const
const DLLCONST = {};
DLLCONST.INVALID_DEV_INDEX = -1;
DLLCONST.PAEW_CALLBACK_DATA_MAX_LEN = 1024;
DLLCONST.PAEW_COIN_ADDRESS_MAX_LEN = 0x80;
DLLCONST.PAEW_BTC_SIG_MAX_LEN = 0x70;
DLLCONST.PAEW_ETH_SIG_MAX_LEN = 0x45;
DLLCONST.PAEW_CYB_SIG_MAX_LEN = 0x41;
DLLCONST.PAEW_EOS_SIG_MAX_LEN = 0x80;
DLLCONST.PAEW_LTC_SIG_MAX_LEN = 0x70;
DLLCONST.PAEW_NEO_SIG_MAX_LEN = 0x70;

module.exports = {
    DLLRET,
    DLLPSTEP,
    DLLPSTATUS,
    DLLDEVINFO,
    DLLCOINTYPE,
    DLLDEVTYPE,
    DLLCONST
};
