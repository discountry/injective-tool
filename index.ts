import {
  MsgSend,
  MsgBroadcasterWithPk,
  PrivateKey,
  ChainRestAuthApi,
  IndexerGrpcAccountApi,
  ChainGrpcBankApi,
} from "@injectivelabs/sdk-ts";
import { BigNumberInBase, BigNumberInWei } from "@injectivelabs/utils";
import {
  Network,
  getNetworkInfo,
  getNetworkEndpoints,
} from "@injectivelabs/networks";
import "dotenv/config";

const inscription =
  "ZGF0YToseyJwIjoiaW5qcmMtMjAiLCJvcCI6Im1pbnQiLCJ0aWNrIjoiSU5KUyIsImFtdCI6IjIwMDAifQ==";

const privateKeyHash = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "";
const privateKey = PrivateKey.fromHex(privateKeyHash);
const injectiveAddress = privateKey.toBech32();

const amount = {
  denom: "inj",
  amount: new BigNumberInBase(0.03).toWei().toFixed(),
};
const msg = MsgSend.fromJSON({
  amount,
  srcInjectiveAddress: injectiveAddress,
  dstInjectiveAddress: "inj15jy9vzmyy63ql9y6dvned2kdat2994x5f4ldu4",
});

async function account(address: string) {
  /** Account Details **/
  // const network = getNetworkInfo(Network.Testnet);
  // const chainRestAuthApi = new ChainRestAuthApi(network.rest)
  // const accountDetails = await chainRestAuthApi.fetchAccount(
  //   address
  // );
  // console.log(`Account Details: ${JSON.stringify(accountDetails)}`);
  const endpoints = getNetworkEndpoints(Network.Testnet);

  const chainGrpcBankApi = new ChainGrpcBankApi(endpoints.grpc);

  const balances = await chainGrpcBankApi.fetchBalance({
    accountAddress: address,
    denom: "inj",
  });

  console.log(
    `Balance: ${new BigNumberInWei(balances.amount).toBase()} ${balances.denom}`
  );
}

async function signTransaction() {
  const txHash = await new MsgBroadcasterWithPk({
    privateKey,
    network: Network.Testnet,
  }).broadcast({
    msgs: msg,
    memo: inscription,
  });

  console.log(txHash.txHash, txHash.timestamp);
}

async function main() {
  for (let i = 0; i < 1000; i++) {
    await account(injectiveAddress);
    await signTransaction();
  }
}

main();
