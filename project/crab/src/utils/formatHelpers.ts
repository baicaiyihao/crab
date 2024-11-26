export function formatTokenBalance(balance: bigint, decimals: number): string {
    const integer = balance / BigInt(10 ** decimals);
    const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
    return `${integer}.${decimal}`;
}
