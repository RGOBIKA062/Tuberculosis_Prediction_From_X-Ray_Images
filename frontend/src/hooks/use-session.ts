import { useEffect, useState } from "react";
import { getLocalUser } from "@/lib/frontend-store";

export function useSession() {
  const [user, setUser] = useState(getLocalUser);

  useEffect(() => {
    const refresh = () => setUser(getLocalUser());
    window.addEventListener("pulmoscan-auth", refresh);
    return () => window.removeEventListener("pulmoscan-auth", refresh);
  }, []);

  return { user, session: user, loading: false };
}
