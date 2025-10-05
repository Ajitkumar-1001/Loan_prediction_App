import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    type ReactNode,
  } from "react";
  
  type Roles = "guest" | "user" | "admin";
  
  type Name = string|null; 

  
  interface RolesContextType {
    role: Roles;
    firstname : Name; 
    setRole: (role: Roles) => void;
    setName : (name:Name)=> void; 
    logout: () => void;
  }
  
  interface InheritProps {
    children: ReactNode;
  }
  
  const RoleContext = createContext<RolesContextType | undefined>(undefined);
  
  export const RoleProvider: React.FC<InheritProps> = ({ children }) => {
    const [role, setRoleState] = useState<Roles>("guest");
    const [firstname, setFirstName] = useState<Name>(null);  
   
    useEffect(() => {
      const storedRole = localStorage.getItem("user_role") as Roles | null;
      const storedName = localStorage.getItem("firstname");
      if (storedRole === "user" || storedRole === "admin") {
        setRoleState(storedRole);
        setFirstName(storedName);
      }
    }, []);
  
   
    const setRole = (newRole: Roles) => {
      setRoleState(newRole);
      localStorage.setItem("user_role", newRole);
    };
  
    const setName = (newName : Name) => { 
      setFirstName(newName); 
      if (newName){
      localStorage.setItem("firstname",newName);}
    };

    const logout = () => {
      setRoleState("guest");
      setFirstName(null); 
      localStorage.removeItem("user_role");
      localStorage.removeItem("access_token"); 
    };
  
    return (
      <RoleContext.Provider value={{  role, firstname, setRole, setName, logout }}>
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
  