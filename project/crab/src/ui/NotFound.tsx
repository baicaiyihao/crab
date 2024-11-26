import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
            <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-purple-600 text-white text-lg font-semibold rounded-md hover:bg-purple-700 transition duration-300"
            >
                Go Back Home
            </button>
        </div>
    );
};

export default NotFound;
