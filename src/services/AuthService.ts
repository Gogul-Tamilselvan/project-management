import { connectSupabase } from "./config";
export const getCurrentUserRoleService = async () => {
  const {
    data: { user },
    error: authError,
  } = await connectSupabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: employee, error } = await connectSupabase
    .from("employee")
    .select("id, email, role, name")
    .eq("email", user.email);

  if (error) {
    return null;
  }

  if (!employee) {
    return null;
  }

  return {
    email: user.email ?? "",
    id: employee?.[0].id,
    role: employee?.[0].role,
    name: employee?.[0].name,
  };
};

export const getUserEmailEmp = async (id: string) => {
  const { data: employee, error } = await connectSupabase
    .from("employee")
    .select("id, email, role, name")
    .eq("id", id);

  if (error) return null;

  return {
    email: employee?.[0].email,
    id: employee?.[0].id,
    role: employee?.[0].role,
    name: employee?.[0].name,
  };
};
