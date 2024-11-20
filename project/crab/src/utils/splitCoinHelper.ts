import { Transaction } from "@mysten/sui/transactions";
import suiClient from "../cli/suiClient.ts";
import {TESTNET_GAS_AMOUNTS} from "../config/constants.ts";

/**
 * 使用 Transaction 分离 SUI 代币
 * @param tx Transaction 对象
 * @param coinObjectId 要分离的代币对象 ID
 * @param splitAmount 分离出的金额
 * @returns 新分离代币的 TransactionArgument
 */
export async function splitSuiCoinWithTx(
    tx: Transaction,
    coinObjectId: string,
    splitAmount: number | bigint | string
) {
    try {
        // 添加 splitCoins 指令到 Transaction
        const splitCoinResult = tx.splitCoins(
            coinObjectId,
            [splitAmount] // 分离出的金额列表，可以扩展支持多个金额
        );

        console.log(`Split coin command added to transaction for amount: ${splitAmount}`);
        return splitCoinResult;
    } catch (error) {
        console.error("Error in splitSuiCoinWithTx:", error);
        throw error;
    }
}

/**
 * 获取账户中符合条件的 SUI 代币，并分离出指定金额
 * @param tx Transaction 对象
 * @param ownerAddress SUI 地址
 * @returns 分离后新创建的代币 TransactionArgument
 */
export async function splitSuiToken(
    tx: Transaction,
    ownerAddress: string
) {
    try {
        if (!ownerAddress) {
            throw new Error("No connected account found.");
        }
        // 获取账户中所有的 SUI 代币

        const coins = await suiClient.getCoins({ owner: ownerAddress });
        // 找到余额大于等于分离金额的 SUI 代币
        const largeCoin = coins.data.find((coin) => BigInt(coin.balance) >= BigInt(TESTNET_GAS_AMOUNTS));

        if (!largeCoin) {
            console.warn("No SUI coin found with sufficient balance.");
            return null;
        }

        console.log(`Found large SUI coin: ${largeCoin.coinObjectId} with balance: ${largeCoin.balance}`);

        // 使用 Transaction 执行分离操作
        return splitSuiCoinWithTx(tx, largeCoin.coinObjectId, TESTNET_GAS_AMOUNTS);
    } catch (error) {
        console.error("Error in splitSuiToken:", error);
        throw error;
    }
}
