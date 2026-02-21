import {
  Contract,
  Networks,
  SorobanRpc,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
  StrKey,
} from "@stellar/stellar-sdk";
import { signTransaction, getPublicKey } from "@/app/stellar-wallets-kit";

// Contract address - should be set via environment variable in production
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVHIX3R2KZ5XK6D3V3V4X5X5X5X5";

// RPC server URL - should be set via environment variable
const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  "https://soroban-rpc.mainnet.stellar.org";

// Network passphrase
const NETWORK_PASSPHRASE = Networks.PUBLICNET_PASSPHRASE;

/**
 * Get the RPC server instance
 */
export function getRpcServer(): SorobanRpc.Server {
  return new SorobanRpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });
}

/**
 * Get the contract instance
 */
export function getContract(): Contract {
  return new Contract(CONTRACT_ADDRESS);
}

/**
 * Convert a Stellar address string to an Address ScVal
 */
function addressToScVal(address: string): xdr.ScVal {
  const publicKey = StrKey.decodeEd25519PublicKey(address);
  return Address.fromString(address).toScVal();
}

/**
 * Convert a string to ScVal
 */
function stringToScVal(str: string): xdr.ScVal {
  return nativeToScVal(str, { type: "string" });
}

/**
 * Convert a number to i128 ScVal
 */
function i128ToScVal(value: number | string): xdr.ScVal {
  // Convert to BigInt for i128
  const bigIntValue = BigInt(Math.floor(Number(value) * 1_000_000)); // Assuming 6 decimals
  return nativeToScVal(bigIntValue.toString(), { type: "i128" });
}

/**
 * Convert a number to u64 ScVal
 */
function u64ToScVal(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: "u64" });
}

/**
 * Create a pool on the Soroban contract
 * @param formData - Pool creation form data
 * @returns Transaction hash and pool ID
 */
export async function createPool(formData: {
  name: string;
  description: string;
  externalUrl: string;
  imageHash: string;
  targetAmount: string;
  deadline: number; // Unix timestamp in seconds
}): Promise<{ txHash: string; poolId: number }> {
  const publicKey = await getPublicKey();
  if (!publicKey) {
    throw new Error("Wallet not connected");
  }

  const rpc = getRpcServer();
  const contract = getContract();

  // Convert deadline to seconds (assuming it's provided in seconds)
  const deadlineSeconds = formData.deadline;

  // Prepare function arguments
  const args = [
    stringToScVal(formData.name), // name
    {
      // metadata: PoolMetadata
      description: stringToScVal(formData.description),
      external_url: stringToScVal(formData.externalUrl),
      image_hash: stringToScVal(formData.imageHash),
    },
    addressToScVal(publicKey), // creator
    i128ToScVal(formData.targetAmount), // target_amount
    u64ToScVal(deadlineSeconds), // deadline
    nativeToScVal(null, { type: "option" }), // required_signatures: None
    nativeToScVal(null, { type: "option" }), // signers: None
  ];

  // Build the transaction
  const sourceAccount = await rpc.getAccount(publicKey);
  const builder = new SorobanRpc.TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Add contract invocation
  const operation = contract.call("save_pool", ...args);
  builder.addOperation(operation);

  // Build and simulate the transaction
  const transaction = builder.build();
  const simResponse = await rpc.simulateTransaction(transaction);

  if (SorobanRpc.Api.isSimulationError(simResponse)) {
    throw new Error(`Simulation failed: ${simResponse.error}`);
  }

  // Restore the transaction with the simulation results
  const restoredTx = SorobanRpc.assembleTransaction(
    transaction,
    simResponse
  ).build();

  // Sign the transaction using the wallet kit
  const signedTx = await signTransaction(restoredTx.toXDR(), {
    network: NETWORK_PASSPHRASE,
    accountToSign: publicKey,
  });

  // Send the transaction
  const sendResponse = await rpc.sendTransaction(signedTx);
  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction failed: ${sendResponse.errorResult?.message || "Unknown error"}`);
  }

  // Wait for the transaction to be included in a ledger
  const getTxResponse = await rpc.getTransaction(sendResponse.hash);
  if (getTxResponse.status === "NOT_FOUND") {
    // Poll for the transaction
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const tx = await rpc.getTransaction(sendResponse.hash);
      if (tx.status !== "NOT_FOUND") {
        if (tx.status === "SUCCESS" && tx.resultXdr) {
          // Decode the result to get the pool ID
          const result = scValToNative(xdr.ScVal.fromXDR(tx.resultXdr, "base64"));
          return {
            txHash: sendResponse.hash,
            poolId: Number(result),
          };
        } else {
          throw new Error(`Transaction failed: ${tx.status}`);
        }
      }
      attempts++;
    }
    throw new Error("Transaction timeout");
  }

  if (getTxResponse.status === "SUCCESS" && getTxResponse.resultXdr) {
    const result = scValToNative(xdr.ScVal.fromXDR(getTxResponse.resultXdr, "base64"));
    return {
      txHash: sendResponse.hash,
      poolId: Number(result),
    };
  }

  throw new Error(`Transaction failed: ${getTxResponse.status}`);
}

/**
 * Get Stellar Expert explorer URL for a transaction
 */
export function getStellarExpertUrl(txHash: string): string {
  return `https://stellar.expert/explorer/public/tx/${txHash}`;
}