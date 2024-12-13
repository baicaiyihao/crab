import React, { useEffect, useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

interface QueryDynamicFieldsAndImagesProps {
  coin_address: string; // 添加一个 coin_address 属性到 props 中
}

const GetCoinIcon: React.FC<QueryDynamicFieldsAndImagesProps> = ({ coin_address }) => {
  const parentId = "0x27cdf1b6ed6b827810933d2c6617ee4d8b49c677ba3b3a2c3add500d88b2dd36";
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

  useEffect(() => {
    const fetchDynamicFields = async () => {
      setIsLoading(true);
      setError(null);
      setImageUrl(null);

      try {
        const response = await suiClient.getDynamicFields({ parentId });
        const parts = coin_address.split('::');
        if (parts.length !== 3) {
          setError("Invalid coin address format.");
          return;
        }
        const specificName = parts[1];

        for (const field of response.data) {
          if (field.name.value === specificName) {
            const objectResponse = await suiClient.getObject({
              id: field.objectId,
              options: { showContent: true },
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const value = objectResponse.data?.content?.fields?.value || "Unknown";
            const imageUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${value}`;
            setImageUrl(imageUrl);
            break; // Exit loop after finding the first match
          }
        }


        if (!imageUrl) {
          null
        }
      } catch (err: unknown) {
        setError(`Error fetching dynamic fields: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicFields();
  }, [coin_address]);

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {imageUrl ? (
        <img src={imageUrl} alt="sui" style={{width:23.99,height:23.99}} />
      ) : (
        <img src="https://aggregator.walrus-testnet.walrus.space/v1/ZUBFcGO-Tb7MvCMhlHuc9gh2pdCwVVEbxWRPhPIZ8lM" alt="sui" style={{width:23.99,height:23.99}} />
      )}
    </div>
  );
};

export default GetCoinIcon;



