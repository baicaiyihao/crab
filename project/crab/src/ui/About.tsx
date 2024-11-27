import React from "react";

const About: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1F1B2D] text-white">
            <h1 className="text-4xl font-bold mb-6">About Crab</h1>
            <p className="text-lg leading-8 text-center max-w-3xl">
                Crab is an innovative platform designed to identify, collect, and recycle scam or phishing tokens in the blockchain ecosystem.
                With an automated and decentralized approach, Crab aims to make the digital asset space safer by detecting malicious tokens
                and providing users with tools to secure their assets. By participating in Crab, you contribute to a cleaner and safer
                blockchain environment.
            </p>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Key Features:</h2>
                <ul className="list-disc list-inside space-y-2 text-lg">
                    <li>Automated detection of scam and phishing tokens.</li>
                    <li>Token recycling for a more secure ecosystem.</li>
                    <li>Decentralized governance ensuring transparency and fairness.</li>
                    <li>Enhanced security for users and their digital assets.</li>
                </ul>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Why Choose Crab?</h2>
                <p className="text-lg leading-8 text-center max-w-3xl">
                    Crab stands at the forefront of blockchain security by offering a platform that prioritizes user protection
                    and ecosystem health. Our mission is to empower users to take control of their assets, prevent scams, and
                    build a sustainable and trustworthy blockchain future.
                </p>
            </div>
        </div>
    );
};

export default About;
