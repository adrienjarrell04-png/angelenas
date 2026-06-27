import { createServerFn } from "@tanstack/react-start";
import { 
  getUser as getSrvUser, 
  logout as srvLogout, 
  login as srvLogin 
} from "./auth.server";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  return await getSrvUser();
});

export const login = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    return await srvLogin(data.email, data.password);
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  return await srvLogout();
});
