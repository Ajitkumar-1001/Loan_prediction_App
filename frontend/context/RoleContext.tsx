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
    email: string | null;
    loginTimestamp: number;
    setRole: (role: Roles) => void;
    setName : (name:Name)=> void;
    setEmail: (email: string | null) => void;
    logout: () => void;
  }
  
  interface InheritProps {
    children: ReactNode;
  }
  
  const RoleContext = createContext<RolesContextType | undefined>(undefined);
  
  export const RoleProvider: React.FC<InheritProps> = ({ children }) => {
    const [role, setRoleState] = useState<Roles>("guest");
    const [firstname, setFirstName] = useState<Name>(null);
    const [email, setEmailState] = useState<string | null>(null);
    const [loginTimestamp, setLoginTimestamp] = useState<number>(Date.now());

    useEffect(() => {
      const storedRole = localStorage.getItem("user_role") as Roles | null;
      const storedName = localStorage.getItem("firstname");
      const storedEmail = localStorage.getItem("user_email");
      if (storedRole === "user" || storedRole === "admin") {
        setRoleState(storedRole);
        setFirstName(storedName);
        setEmailState(storedEmail);
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

    const setEmail = (newEmail: string | null) => {
      setEmailState(newEmail);
      if (newEmail) {
        localStorage.setItem("user_email", newEmail);
        // Update login timestamp to trigger fresh session creation
        setLoginTimestamp(Date.now());
      } else {
        localStorage.removeItem("user_email");
      }
    };

    const logout = () => {
      // Clear user-specific chat sessions BEFORE clearing email
      if (email) {
        const userSessionKey = `chatbot_session_${email}`;
        localStorage.removeItem(userSessionKey);
      }

      setRoleState("guest");
      setFirstName(null);
      setEmailState(null);
      localStorage.removeItem("user_role");
      localStorage.removeItem("access_token");
      localStorage.removeItem("firstname");
      localStorage.removeItem("user_email");

      // Clear all chat-related data
      localStorage.removeItem("chatbot_session_id"); // Old global key
      const chatKeys = Object.keys(localStorage).filter(key =>
        key.startsWith("chat_history_") || key.startsWith("chatbot_session_")
      );
      chatKeys.forEach(key => localStorage.removeItem(key));
    };

    return (
      <RoleContext.Provider value={{  role, firstname, email, loginTimestamp, setRole, setName, setEmail, logout }}>
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
  