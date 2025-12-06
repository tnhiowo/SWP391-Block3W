"use client";

import { createContext,useContext,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApiService } from "../services/authApiService";
import { userApiService } from "../services/userApiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user,setUser] = useState(null);
    const [isLoading,setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            const accessToken = localStorage.getItem("accessToken");
            const userData = localStorage.getItem("authUser");

            if (accessToken && userData) {
                setUser(JSON.parse(userData));
            }
            setIsLoading(false);
        };
        loadUser();
    },[]);

    const login = async (data) => {
        try {
            const res = await authApiService.login(data);

            const { token,userId,fullName,role,email,avatar } = res.data;
            const userData = {
                userId,
                username: email,
                fullName,
                roles: [role],
                email,
                avatar
            };

            localStorage.setItem("accessToken",token);
            localStorage.setItem("authUser",JSON.stringify(userData));

            await loadUser();
            return res;
        } catch (err) {
            throw err;
        }
    };

    const loadUser = async () => {
        try {
            const res = await userApiService.getProfile();
            const profile = res.data;
            const user = {
                userId: profile.userId,
                username: profile.username || profile.email,
                fullName: profile.fullName,
                roles: [profile.role],
                email: profile.email,
                phone: profile.phone,
                status: profile.status,
                avatar: profile.avatar
            };
            localStorage.setItem("authUser",JSON.stringify(user));
            setUser(user);
        } catch (err) {
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user,isLoading,login,logout,loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);