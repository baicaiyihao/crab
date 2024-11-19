import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";

async function mergeCoins(coinObjects: string[], gasBudget: number) {
    const tx = new Transaction();
    const mergedCoin = coinObjects[0]; // 使用第一个对象作为合并目标

    // 调用 mergeCoins 合并所有对象
    tx.mergeCoins(
        mergedCoin, // 主对象
        coinObjects.slice(1) // 其余对象作为源对象
    );

    // 设置 gas 预算
    tx.setGasBudget(gasBudget);

    // 执行交易
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const result = signAndExecute({
        transaction: tx,
    });

    console.log("Merge result:", result);
    return mergedCoin; // 返回合并后的主对象
}
