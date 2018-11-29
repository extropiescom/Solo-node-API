# Solo-node-API
node ffi wrapper for Solo C-level API and simple sample

Supported OS list:

macOS Mavericks (10.9) and above

Windows 7/8/8.1/10 x64

tested on nodejs v8.9.3

use the following commands to run:
```
npm install
node index.js
```


All the APIs are defined in [PAEWallet.h](https://github.com/extropiescom/Solo-C-API/blob/master/PA_EWallet.h)


## 1. How to connect and disconnect:
   - Use `PAEW_InitContext` to connect device
   - User `PAEW_FreeContext` to disconnect device.
## 2. How to get EOS address:
   - Invoke `PAEW_DeriveTradeAddress`, with
   `derivePath = [0, 0x8000002C, 0x800000c2, 0x80000000, 0x00000000, 0x00000000]` as shown in [config.json](https://github.com/extropiescom/Solo-node-API/blob/master/config/config.json) according to [slip-44](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
   - Invoke `PAEW_GetTradeAddress` to get EOS address.
## 3. How to sign EOS transaction:
   Please refer to `eosSignTest` in [index.js](https://github.com/extropiescom/Solo-node-API/blob/master/index.js)
   - Invoke `PAEW_DeriveTradeAddress`, with
   `derivePath = {0, 0x8000002C, 0x800000c2, 0x80000000, 0x00000000, 0x00000000};` as shown in [config.json](https://github.com/extropiescom/Solo-node-API/blob/master/config/config.json) according to [slip-44](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
   
   - Invoke `PAEW_EOS_TXSign(void * const pPAEWContext, const size_t nDevIndex, const unsigned char * const pbCurrentTX, const size_t nCurrentTXLen, unsigned char * const pbTXSig, size_t * const pnTXSigLen)`, 
   
 ## 4. How to sign BTC and ETH transaction: 
 Please refer to `btcSignTest` and `ethSignTest` in [index.js](https://github.com/extropiescom/Solo-node-API/blob/master/index.js)
 Similar to EOS, Invoke `PAEW_DeriveTradeAddress` first, then call `PAEW_BTC_TXSign` or `PAEW_ETH_TXSign` to get sign result


