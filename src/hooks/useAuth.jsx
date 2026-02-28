// src/hooks/useAuth.jsx
import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext/AuthContest";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;