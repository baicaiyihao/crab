import { getFullnodeUrl } from "@mysten/sui/client";
import {
  TESTNET_CRAB_PACKAGE_ID,
  MAINNET_CRAB_PACKAGE_ID,
} from "./constants";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        crabPackageId: TESTNET_CRAB_PACKAGE_ID,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        crabPackageId: MAINNET_CRAB_PACKAGE_ID,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
