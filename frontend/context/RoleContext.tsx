import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    type ReactNode,
  } from "react";
  
  type Roles = "guest" | "user" | "admin";
  
  interface RolesContextType {
    role: Roles;
    setRole: (role: Roles) => void;
    logout: () => void;
  }
  
  interface InheritProps {
    children: ReactNode;
  }
  
  const RoleContext = createContext<RolesContextType | undefined>(undefined);
  
  export const RoleProvider: React.FC<InheritProps> = ({ children }) => {
    const [role, setRoleState] = useState<Roles>("guest");
  
    // Load role from localStorage on first render
    useEffect(() => {
      const storedRole = localStorage.getItem("user_role") as Roles | null;
      if (storedRole === "user" || storedRole === "admin") {
        setRoleState(storedRole);
      }
    }, []);
  
    // Set role and persist in localStorage
    const setRole = (newRole: Roles) => {
      setRoleState(newRole);
      localStorage.setItem("user_role", newRole);
    };
  
    // Clear role and token on logout
    const logout = () => {
      setRoleState("guest");
      localStorage.removeItem("user_role");
      localStorage.removeItem("access_token"); // optional if you're storing token
    };
  
    return (
      <RoleContext.Provider value={{ role, setRole, logout }}>
        {children}
      </RoleContext.Provider>
    );
  };
  
  export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
      throw new Error("useRole must be used within a RoleProvider");
    }
    return context;
  };
  