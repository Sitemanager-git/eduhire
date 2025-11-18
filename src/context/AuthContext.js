/**
 * Authentication Context - React Context for Auth State Management
 * Manages user authentication state across the application
 * Version: 2.1 (November 9, 2025 - Day 14 Corrections)
 */

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const savedToken = localStorage.getItem("token");
                const savedUser = localStorage.getItem("user");

                console.log('🔍 Initializing auth from localStorage...');
                console.log('Token exists:', !!savedToken);
                console.log('User data exists:', !!savedUser);

                if (savedToken && savedUser) {
                    try {
                        const parsedUser = JSON.parse(savedUser);
                        
                        // Set all state together
                        setToken(savedToken);
                        setUser(parsedUser);
                        setIsAuthenticated(true);
                        
                        console.log("✓ Auth initialized with user:", parsedUser.email);
                    } catch (parseError) {
                        console.error("❌ Failed to parse saved user:", parseError);
                        
                        // Clear corrupted data
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        localStorage.removeItem("userType");
                    }
                } else {
                    console.log('ℹ️  No saved session found');
                }
            } catch (error) {
                console.error("❌ Error initializing auth:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []); // Run only once on mount

    /**
     * Login function
     * @param {string} userToken - JWT token from backend
     * @param {object} userData - User data object with id, email, userType
     */
    const login = (userToken, userData = null) => {
        console.log("🔐 Login function called");
        console.log("Token received:", !!userToken);
        console.log("User data received:", userData);

        // CRITICAL: Store token in localStorage
        localStorage.setItem("token", userToken);
        console.log("✓ Token saved to localStorage");

        // Store user data if provided
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("userType", userData.userType);
            setUser(userData);
            console.log("✓ User data saved to localStorage");
        }

        // Update React state
        setToken(userToken);
        setIsAuthenticated(true);

        // Verify token was stored correctly
        const storedToken = localStorage.getItem("token");
        console.log("✓ Token verification:", !!storedToken);
    };

    /**
     * Logout function
     * Clears all authentication data from state and localStorage
     */
    const logout = () => {
        console.log("🚪 Logout function called");

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");

        // Clear state
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);

        console.log("✓ User logged out - all data cleared");
    };

    /**
     * Context value object
     */
    const value = {
        token,
        user,
        isAuthenticated,
        loading,
        userType: user?.userType || null,
        login,
        logout
    };

    // Show loading spinner while initializing
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
                <div>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}>
                        Loading...
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        Initializing Eduhire
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};