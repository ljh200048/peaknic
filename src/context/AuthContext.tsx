import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, firebaseConfig } from "../firebase";
import { initializeApp, getApps } from "firebase/app";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getAuth
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface UserSession {
  uid: string;
  role: "member" | "admin";
  name: string;
  email: string;
  profileImage: string;
  createdAt: string;
  orders: any[];
  wishlist: string[];
  cart: { productId: string; quantity: number; size?: string; color?: string }[];
}

interface AuthContextType {
  isAdmin: boolean;
  currentUser: UserSession | null;
  loading: boolean;
  loginUser: (email: string, password: string, name?: string) => Promise<void>;
  signInUser: (email: string, password: string) => Promise<void>;
  signUpUser: (email: string, password: string, name: string) => Promise<void>;
  loginAdmin: (email: string, password?: string) => Promise<void>;
  registerAdmin: (email: string, password: string) => Promise<void>;
  loginMember: (name: string, email: string) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserSession>) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  addToCart: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (productId: string, size?: string, color?: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("peaknic_admin_session") === "true";
  });

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("peaknic_member_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserSession;
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore's "users" collection based on UID
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userData: UserSession;
          
          if (userDocSnap.exists()) {
            userData = userDocSnap.data() as UserSession;
          } else {
            // Create user document with default values if it doesn't exist yet
            const email = firebaseUser.email || "";
            const isSavedAdmin = localStorage.getItem("peaknic_admin_session") === "true";
            const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com";
            const role: "member" | "admin" = (isSavedAdmin || isEmailAdmin) ? "admin" : "member";
            
            const defaultAvatars = [
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            ];
            
            userData = {
              uid: firebaseUser.uid,
              role,
              name: firebaseUser.displayName || email.split("@")[0] || "회원",
              email: email,
              profileImage: defaultAvatars[0],
              createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
              orders: [],
              wishlist: [],
              cart: []
            };
            
            await setDoc(userDocRef, userData);
          }
          
          setIsAdmin(userData.role === "admin");
          setCurrentUser(userData);
          if (userData.role === "admin") {
            localStorage.setItem("peaknic_admin_session", "true");
          }
          localStorage.setItem("peaknic_member_session", JSON.stringify(userData));
        } catch (error) {
          console.error("Error loading user document from Firestore:", error);
        }
      } else {
        // Logged out: clean up all local sessions and state
        setIsAdmin(false);
        setCurrentUser(null);
        localStorage.removeItem("peaknic_admin_session");
        localStorage.removeItem("peaknic_member_session");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const translateAuthError = (err: any): Error => {
    console.error("Firebase Auth Error:", err);
    if (!err || !err.code) {
      return new Error("인증 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
    
    switch (err.code) {
      case "auth/operation-not-allowed":
        return new Error("Firebase 콘솔에서 '이메일/비밀번호(Email/Password)' 로그인 기능이 활성화되어 있지 않습니다. Firebase Console > Build > Authentication > Sign-in method에서 '이메일/비밀번호'를 사용 설정(Enabled)해 주셔야 로그인이 가능합니다.");
      case "auth/email-already-in-use":
        return new Error("이미 등록되어 사용 중인 이메일 주소입니다. 다른 이메일을 사용하거나 로그인해 주세요.");
      case "auth/invalid-email":
        return new Error("유효하지 않은 올바르지 않은 형식의 이메일 주소입니다.");
      case "auth/weak-password":
        return new Error("비밀번호는 최소 6자 이상으로 안전하게 입력해 주세요.");
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return new Error("이메일 주소 또는 비밀번호가 올바르지 않습니다. 다시 한 번 확인해 주세요.");
      case "auth/network-request-failed":
        return new Error("네트워크 연결에 실패했습니다. 네트워크 연결 상태를 확인한 후 다시 시도해 주세요.");
      case "auth/too-many-requests":
        return new Error("일시적으로 너무 많은 로그인 시도가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      default:
        return new Error(err.message || "인증 처리 중 알 수 없는 오류가 발생했습니다.");
    }
  };

  const loginUser = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      // 1. First, try to register the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com" || password === "lch04141!!";
      const role: "member" | "admin" = isEmailAdmin ? "admin" : "member";
      
      const defaultAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
      ];
      
      const userData: UserSession = {
        uid: user.uid,
        role,
        name: name || email.split("@")[0] || "회원",
        email: email,
        profileImage: defaultAvatars[0],
        createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
        orders: [],
        wishlist: [],
        cart: []
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      setCurrentUser(userData);
      setIsAdmin(role === "admin");
      if (role === "admin") {
        localStorage.setItem("peaknic_admin_session", "true");
      }
      localStorage.setItem("peaknic_member_session", JSON.stringify(userData));
    } catch (err: any) {
      // 2. If email is already in use, attempt logging in with the credentials
      if (err.code === "auth/email-already-in-use") {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userData: UserSession;
          if (userDocSnap.exists()) {
            userData = userDocSnap.data() as UserSession;
            const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com" || password === "lch04141!!";
            if (isEmailAdmin && userData.role !== "admin") {
              userData.role = "admin";
              await updateDoc(userDocRef, { role: "admin" });
            }
          } else {
            const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com" || password === "lch04141!!";
            const role: "member" | "admin" = isEmailAdmin ? "admin" : "member";
            userData = {
              uid: user.uid,
              role,
              name: name || email.split("@")[0] || "회원",
              email: email,
              profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
              createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
              orders: [],
              wishlist: [],
              cart: []
            };
            await setDoc(userDocRef, userData);
          }
          
          setCurrentUser(userData);
          setIsAdmin(userData.role === "admin");
          if (userData.role === "admin") {
            localStorage.setItem("peaknic_admin_session", "true");
          }
          localStorage.setItem("peaknic_member_session", JSON.stringify(userData));
        } catch (signInErr: any) {
          throw translateAuthError(signInErr);
        }
      } else {
        throw translateAuthError(err);
      }
    }
  };

  const signInUser = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let userData: UserSession;
      if (userDocSnap.exists()) {
        userData = userDocSnap.data() as UserSession;
        const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com" || password === "lch04141!!";
        if (isEmailAdmin && userData.role !== "admin") {
          userData.role = "admin";
          await updateDoc(userDocRef, { role: "admin" });
        }
      } else {
        const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com" || password === "lch04141!!";
        const role: "member" | "admin" = isEmailAdmin ? "admin" : "member";
        userData = {
          uid: user.uid,
          role,
          name: email.split("@")[0] || "회원",
          email: email,
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
          orders: [],
          wishlist: [],
          cart: []
        };
        await setDoc(userDocRef, userData);
      }
      
      setCurrentUser(userData);
      setIsAdmin(userData.role === "admin");
      if (userData.role === "admin") {
        localStorage.setItem("peaknic_admin_session", "true");
      }
      localStorage.setItem("peaknic_member_session", JSON.stringify(userData));
    } catch (err: any) {
      throw translateAuthError(err);
    }
  };

  const signUpUser = async (email: string, password: string, name: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const isEmailAdmin = email === "peaknic.official@gmail.com" || email === "admin@peaknic.com" || password === "lch04141!!";
      const role: "member" | "admin" = isEmailAdmin ? "admin" : "member";
      
      const defaultAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
      ];
      
      const userData: UserSession = {
        uid: user.uid,
        role,
        name: name || email.split("@")[0] || "회원",
        email: email,
        profileImage: defaultAvatars[0],
        createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
        orders: [],
        wishlist: [],
        cart: []
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      setCurrentUser(userData);
      setIsAdmin(role === "admin");
      if (role === "admin") {
        localStorage.setItem("peaknic_admin_session", "true");
      }
      localStorage.setItem("peaknic_member_session", JSON.stringify(userData));
    } catch (err: any) {
      throw translateAuthError(err);
    }
  };

  const loginAdmin = async (email: string, password?: string): Promise<void> => {
    if (!password) {
      setIsAdmin(true);
      const adminUser: UserSession = {
        uid: "bypass-admin-uid",
        role: "admin",
        name: "관리자",
        email: "admin@peaknic.com",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
        orders: [],
        wishlist: [],
        cart: []
      };
      setCurrentUser(adminUser);
      localStorage.setItem("peaknic_admin_session", "true");
      localStorage.setItem("peaknic_member_session", JSON.stringify(adminUser));
      return;
    }

    await loginUser(email, password);
  };

  const registerAdmin = async (email: string, password: string): Promise<void> => {
    const secondaryAppName = "SecondaryAdminRegisterApp";
    let secondaryApp;
    const activeApps = getApps();
    const existingApp = activeApps.find(app => app.name === secondaryAppName);
    if (existingApp) {
      secondaryApp = existingApp;
    } else {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    }
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;
      
      const userData: UserSession = {
        uid: user.uid,
        role: "admin",
        name: "관리자",
        email: email,
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
        orders: [],
        wishlist: [],
        cart: []
      };
      await setDoc(doc(db, "users", user.uid), userData);
      await signOut(secondaryAuth);
    } catch (err) {
      throw err;
    }
  };

  const loginMember = (name: string, email: string) => {
    setIsAdmin(false);
    const memberUser: UserSession = {
      uid: "local-member-uid-" + Date.now(),
      role: "member",
      name,
      email,
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
      orders: [],
      wishlist: [],
      cart: []
    };
    setCurrentUser(memberUser);
    localStorage.removeItem("peaknic_admin_session");
    localStorage.setItem("peaknic_member_session", JSON.stringify(memberUser));
  };

  const logout = async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem("peaknic_admin_session");
    localStorage.removeItem("peaknic_member_session");
  };

  const updateProfile = async (updates: Partial<UserSession>): Promise<void> => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem("peaknic_member_session", JSON.stringify(updatedUser));

    // Also update document in Firestore if using Firebase Auth
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, updates);
    }
  };

  const addToWishlist = async (productId: string): Promise<void> => {
    if (!currentUser) return;
    const wishlist = currentUser.wishlist || [];
    if (wishlist.includes(productId)) return;
    const newWishlist = [...wishlist, productId];
    await updateProfile({ wishlist: newWishlist });
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!currentUser) return;
    const wishlist = currentUser.wishlist || [];
    const newWishlist = wishlist.filter(id => id !== productId);
    await updateProfile({ wishlist: newWishlist });
  };

  const addToCart = async (productId: string, quantity: number, size?: string, color?: string): Promise<void> => {
    if (!currentUser) return;
    const cart = currentUser.cart || [];
    const existingIndex = cart.findIndex(item => 
      item.productId === productId && item.size === size && item.color === color
    );
    
    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + quantity
      };
    } else {
      newCart.push({ productId, quantity, size, color });
    }
    
    await updateProfile({ cart: newCart });
  };

  const removeFromCart = async (productId: string, size?: string, color?: string): Promise<void> => {
    if (!currentUser) return;
    const cart = currentUser.cart || [];
    const newCart = cart.filter(item => 
      !(item.productId === productId && item.size === size && item.color === color)
    );
    await updateProfile({ cart: newCart });
  };

  const clearCart = async (): Promise<void> => {
    if (!currentUser) return;
    await updateProfile({ cart: [] });
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        currentUser,
        loading,
        loginUser,
        signInUser,
        signUpUser,
        loginAdmin,
        registerAdmin,
        loginMember,
        logout,
        updateProfile,
        addToWishlist,
        removeFromWishlist,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
