import React, { useState, useEffect } from "react";
import CustomConnectWallet from "./CustomConnectWallet";
import UserInfoDropdown from "./UserInfoDropdown";

const RightActionButtons: React.FC = () => {
    const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex items-center space-x-4">
            {!isNarrowScreen && <UserInfoDropdown />}
            <CustomConnectWallet />

        </div>
    );
};

export default RightActionButtons;
