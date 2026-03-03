// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { auth } from "../firebase/firebaseConfig"; // Import Firebase auth module
// import { onAuthStateChanged, User } from "firebase/auth";

// // Define the type for the context
// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
// }

// // Define the type for the AuthProvider props
// interface AuthProviderProps {
//   children: ReactNode; // Children can be any valid React node
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Create a provider component with children prop type
// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user); // Set the user state
//       setLoading(false); // Set loading to false once the auth state is determined
//     });

//     // Cleanup the subscription on component unmount
//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Create a custom hook to use the auth context
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };












// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase/firebaseConfig';

// Define the user type that matches your Firestore user data
interface UserData {
  uid: string;
  username: string;
  email: string;
  photoURL?: string;
  role?: string;
  // Add other fields from your Firestore user document
}

// Define the auth context type
interface AuthContextType {
  currentUser: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserData: (userData: UserData) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {},
  updateUserData: () => {},
});

// Props type for the provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check local storage for cached user data
  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (error) {
        console.error("Error parsing cached user data:", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Get the user's data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Handle case where user exists in Firebase Auth but not in Firestore
            console.warn("User authenticated but no data found in Firestore");
            const basicUserData: UserData = {
              uid: user.uid,
              username: user.displayName || 'User',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
            };
            setCurrentUser(basicUserData);
            localStorage.setItem('user', JSON.stringify(basicUserData));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout function
  const logout = async (): Promise<void> => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Update user data function (useful after profile updates)
  const updateUserData = (userData: UserData): void => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    currentUser,
    firebaseUser,
    loading,
    logout,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};