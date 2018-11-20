const { DLLDEVINFO, DLLPSTEP, DLLPSTATUS, DLLCOINTYPE } = require("./dllconst");
const sprintf = require("sprintf-js");

//util functions
const DLLUTIL = {};

DLLUTIL.ewallet_lifecycle2string = ucLifeCycle => {
    var szRet = "";

    switch (ucLifeCycle) {
    case DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_INVALID:
        szRet = "invalid";
        break;
    case DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_AGREE:
        szRet = "agree";
        break;
    case DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_PRODUCE:
        szRet = "produce";
        break;
    case DLLDEVINFO.LIFECYCLE.PAEW_DEV_INFO_LIFECYCLE_USER:
        szRet = "user";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_costype2string = ucCOSType => {
    var szRet = "";

    switch (ucCOSType) {
    case DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_DRAGONBALL:
        szRet = "dragon ball";
        break;
    case DLLDEVINFO.COSTYPE.PAEW_DEV_INFO_COS_TYPE_PERSONAL:
        szRet = "personal";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_chaintype2string = ucChainType => {
    var szRet = "";

    switch (ucChainType) {
    case DLLDEVINFO.CHAINTYPE.PAEW_DEV_INFO_CHAIN_TYPE_FORMAL:
        szRet = "formal net";
        break;
    case DLLDEVINFO.CHAINTYPE.PAEW_DEV_INFO_CHAIN_TYPE_TEST:
        szRet = "test net";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_pinstate2string = ucPINState => {
    var szRet = "";

    switch (ucPINState) {
    case DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_INVALID_STATE:
        szRet = "invalid";
        break;
    case DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOGOUT:
        szRet = "logout";
        break;
    case DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOGIN:
        szRet = "login";
        break;
    case DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_LOCKED:
        szRet = "locked";
        break;
    case DLLDEVINFO.PINSTATE.PAEW_DEV_INFO_PIN_UNSET:
        szRet = "unset";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_step2string = pstep => {
    var szRet = "";

    switch (pstep) {
    case DLLPSTEP.pstep_invalid:
        szRet = "invalid";
        break;
    case DLLPSTEP.pstep_comm_enum_dev:
        szRet = "comm_enum_dev";
        break;
    case DLLPSTEP.pstep_comm_open_dev:
        szRet = "comm_open_dev";
        break;
    case DLLPSTEP.pstep_comm_close_dev:
        szRet = "comm_close_dev";
        break;
    case DLLPSTEP.pstep_comm_get_devinfo:
        szRet = "comm_get_devinfo";
        break;
    case DLLPSTEP.pstep_comm_dev_select:
        szRet = "comm_dev_select";
        break;
    case DLLPSTEP.pstep_init_seed_gen:
        szRet = "init_seed_gen";
        break;
    case DLLPSTEP.pstep_init_mne_show:
        szRet = "init_mne_show";
        break;
    case DLLPSTEP.pstep_init_mne_confirm:
        szRet = "init_mne_confirm";
        break;
    case DLLPSTEP.pstep_init_seed_import:
        szRet = "init_seed_import";
        break;
    case DLLPSTEP.pstep_init_seed_import_comfirm:
        szRet = "init_seed_import_confirm";
        break;
    case DLLPSTEP.pstep_init_keypair_gen:
        szRet = "init_keypair_gen";
        break;
    case DLLPSTEP.pstep_init_key_agree_init:
        szRet = "init_key_agree_init";
        break;
    case DLLPSTEP.pstep_init_key_agree_update:
        szRet = "init_key_agree_update";
        break;
    case DLLPSTEP.pstep_init_key_agree_final:
        szRet = "init_key_agree_final";
        break;
    case DLLPSTEP.pstep_init_key_agree_show:
        szRet = "init_key_agree_show";
        break;
    case DLLPSTEP.pstep_init_key_agree_confirm:
        szRet = "init_key_agree_confirm";
        break;
    case DLLPSTEP.pstep_init_shamir_transmit_init:
        szRet = "init_shamir_transmit_init";
        break;
    case DLLPSTEP.pstep_init_shamir_export:
        szRet = "init_shamir_export";
        break;
    case DLLPSTEP.pstep_init_shamir_import:
        szRet = "init_shamir_import";
        break;
    case DLLPSTEP.pstep_init_shamir_confirm:
        szRet = "init_shamir_confirm";
        break;
    case DLLPSTEP.pstep_comm_addr_gen:
        szRet = "comm_addr_gen";
        break;
    case DLLPSTEP.pstep_comm_shamir_transmit_init:
        szRet = "comm_shamir_transmit_init";
        break;
    case DLLPSTEP.pstep_comm_shamir_export:
        szRet = "comm_shamir_export";
        break;
    case DLLPSTEP.pstep_comm_shamir_import:
        szRet = "comm_shamir_import";
        break;
    case DLLPSTEP.pstep_comm_addr_get:
        szRet = "comm_addr_get";
        break;
    case DLLPSTEP.pstep_comm_addr_confirm:
        szRet = "comm_addr_confirm";
        break;
    case DLLPSTEP.pstep_comm_format:
        szRet = "comm_format";
        break;
    case DLLPSTEP.pstep_comm_format_confirm:
        szRet = "comm_format_confirm";
        break;
    case DLLPSTEP.pstep_sig_output_data:
        szRet = "sig_output_data";
        break;
    case DLLPSTEP.pstep_sig_confirm:
        szRet = "sig_confirm";
        break;
    case DLLPSTEP.pstep_comm_clearcos:
        szRet = "comm_clearcos";
        break;
    case DLLPSTEP.pstep_comm_clearcos_confirm:
        szRet = "comm_clearcos_confirm";
        break;
    case DLLPSTEP.pstep_comm_updatecos:
        szRet = "comm_updatecos";
        break;
    case DLLPSTEP.pstep_comm_changepin:
        szRet = "comm_changepin";
        break;
    case DLLPSTEP.pstep_comm_changepin_confirm:
        szRet = "comm_changepin_confirm";
        break;
    case DLLPSTEP.pstep_comm_addr_info_get:
        szRet = "comm_addr_info_get";
        break;
    case DLLPSTEP.pstep_comm_addr_info_set:
        szRet = "comm_addr_info_set";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_status2string = pstatus => {
    var szRet = "";

    switch (pstatus) {
    case DLLPSTATUS.pstatus_invalid:
        szRet = "invalid";
        break;
    case DLLPSTATUS.pstatus_start:
        szRet = "start";
        break;
    case DLLPSTATUS.pstatus_finish:
        szRet = "finish";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_cointype2string = ucCoinType => {
    var szRet = "";

    switch (ucCoinType) {
    case DLLCOINTYPE.PAEW_COIN_TYPE_BTC:
        szRet = "BTC";
        break;
    case DLLCOINTYPE.PAEW_COIN_TYPE_ETH:
        szRet = "ETH";
        break;
    case DLLCOINTYPE.PAEW_COIN_TYPE_CYB:
        szRet = "CYB";
        break;
    case DLLCOINTYPE.PAEW_COIN_TYPE_EOS:
        szRet = "EOS";
        break;
    case DLLCOINTYPE.PAEW_COIN_TYPE_LTC:
        szRet = "LTC";
        break;
    case DLLCOINTYPE.PAEW_COIN_TYPE_NEO:
        szRet = "NEO";
        break;
    default:
        szRet = "unknown";
        break;
    }

    return szRet;
};

DLLUTIL.ewallet_print_buf = data => {
    var szRet = "";

    for (let i of data) {
        szRet += sprintf.sprintf("%02x", i);
    }

    return szRet;
};

DLLUTIL.ewallet_hexstring_to_intarray = data => {
    var szRet = [];
    let tmpStr = "";

    for (let i = 0; i < data.length - 1; i += 2) {
        tmpStr = data[i] + data[i + 1];
        szRet.push(parseInt(tmpStr, 16));
    }

    return szRet;
};

DLLUTIL.ewallet_chararray_to_string = (data, len) => {
    var szRet = "";

    for (let i = 0; i < len; i++) {
        szRet += String.fromCharCode(data[i]);
    }

    return szRet;
};

module.exports = { DLLUTIL };
