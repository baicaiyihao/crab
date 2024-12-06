import React, { useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

interface DynamicField {
    name: string;
    type: string;
    objectId: string;
}

const QueryDynamicFieldsAndImages: React.FC = () => {
    const [parentId, setParentId] = useState<string>("0x27cdf1b6ed6b827810933d2c6617ee4d8b49c677ba3b3a2c3add500d88b2dd36");
    const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
    const [fieldImages, setFieldImages] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

    const fetchDynamicFields = async () => {
        setIsLoading(true);
        setError(null);
        setDynamicFields([]);
        setFieldImages({});

        try {
            const response = await suiClient.getDynamicFields({ parentId });
            const fields: DynamicField[] = response.data.map((field: any) => ({
                name: field.name.value,
                type: field.objectType,
                objectId: field.objectId,
            }));
            setDynamicFields(fields);

            const images: { [key: string]: string } = {};
            for (const field of fields) {
                const objectResponse = await suiClient.getObject({
                    id: field.objectId,
                    options: { showContent: true },
                });

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const value = objectResponse.data?.content?.fields?.value || "Unknown";
                const imageUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${value}`;
                images[field.objectId] = imageUrl;
            }
            setFieldImages(images);
        } catch (err: unknown) {
            setError(`Error fetching dynamic fields: ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Query Dynamic Fields and Images</h1>
            <div>
                <label htmlFor="parent-id">Parent Object ID:</label>
                <input
                    type="text"
                    id="parent-id"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    placeholder="Enter Parent Object ID"
                />
                <button onClick={fetchDynamicFields} disabled={!parentId || isLoading}>
                    {isLoading ? "Loading..." : "Fetch"}
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            {dynamicFields.length > 0 && (
                <div>
                    <h2>Dynamic Fields</h2>
                    <ul>
                        {dynamicFields.map((field) => (
                            <li key={field.objectId}>
                                <strong>Name:</strong> {field.name} <br />
                                <strong>Type:</strong> {field.type} <br />
                                <strong>Object ID:</strong> {field.objectId} <br />
                                <strong>Image:</strong>
                                {fieldImages[field.objectId] ? (
                                    <img
                                        src={fieldImages[field.objectId]}
                                        alt={field.name}
                                        style={{ maxWidth: "200px", marginTop: "10px" }}
                                    />
                                ) : (
                                    "Loading..."
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QueryDynamicFieldsAndImages;
