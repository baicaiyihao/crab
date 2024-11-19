import { Transaction } from "@mysten/sui/transactions";

/**
 * 合并代币对象
 * @param tx - Transaction 对象
 * @param coinObjects - 代币对象 ID 数组
 * @returns Transaction - 返回包含合并操作的 Transaction 对象
 */
export function mergeCoins(tx: Transaction, coinObjects: string[]): Transaction {
    if (coinObjects.length > 1) {
        tx.mergeCoins(
            tx.object(coinObjects[0]), // 第一个对象为主对象
            coinObjects.slice(1).map((id) => tx.object(id)) // 其余对象作为源
        );
    }
    return tx;
}
