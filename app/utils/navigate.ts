import { useNavigate } from "@remix-run/react";

export const useGoBack = () => {
  const navigate = useNavigate();
  return () => navigate(-1);
};
