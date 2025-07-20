import React, {createContext,useState,useContext,ReactNode} from 'react'; 

type roles  =  
    "guest" | "user" | "admin";

interface Roles { 

    role : roles;
    setRole : (role : roles) => void; 
}

interface inherit { 
    children : ReactNode;

}
const RoleContext  = createContext<Roles|undefined>(undefined);

export const RoleProvider : React.FC<inherit>=({children}) => { 

    const [role, setRole] = useState<roles>("guest");

    return ( 

        <RoleContext.Provider value={{role,setRole}}>
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

