import { Transaction } from "@mysten/sui/transactions";
import suiClient from "../cli/suiClient";

/**
 * Helper function to handle splitting SUI for transaction gas or execution.
 * Dynamically determines whether to split from tx.gas or from another SUI object in the wallet.
 *
 * @param tx - The transaction object
 * @param ownerAddress - The address of the wallet owner
 * @param splitAmount - The amount to split
 * @returns TransactionArgument representing the newly split coin
 */
export async function handleSplitGas(
    tx: Transaction,
    ownerAddress: string,
    splitAmount: number | bigint | string
) {
    if (!ownerAddress) {
        throw new Error("Owner address is required.");
    }

    // Fetch all SUI coins owned by the address
    const coins = await suiClient.getCoins({ owner: ownerAddress });

    if (!coins || coins.data.length === 0) {
        throw new Error("No SUI objects found in the wallet.");
    }

    let newCoin;

    // Ensure the coins are of type SUI
    const suiCoins = coins.data.filter((coin) => {
        console.log("coinType:", coin.coinType);
        return coin.coinType === "0x2::sui::SUI";
    });

    if (suiCoins.length === 0) {
        throw new Error("No SUI type objects found in the wallet.");
    }

    if (suiCoins.length > 1) {
        // If there are multiple SUI objects, split from the first one
        const firstCoin = suiCoins[0];
        console.log("Splitting SUI from non-Gas object:", firstCoin.coinObjectId);
        newCoin = tx.splitCoins(firstCoin.coinObjectId, [splitAmount]);
    } else {
        // If there's only one SUI object, split directly from tx.gas
        console.log("Only one SUI object found. Splitting from tx.gas.");
        newCoin = tx.splitCoins(tx.gas, [splitAmount]);
    }

    return newCoin;
}
