// services/coinService.ts
import { getUserProfile } from "./index";
import { CategorizedObjects } from "./assetsHelpers";

export const fetchCoinData = async (address: string): Promise<CategorizedObjects | null> => {
    try {
        const profile = await getUserProfile(address);
        return profile;
    } catch (error) {
        console.error("Error fetching coin data:", error);
        return null;
    }
};
