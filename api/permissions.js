export const requireAuth = (context) => {
  if (!context?.user) {
    throw new Error("You must be logged in");
  }

  return context.user;
};

export const requireAdmin = (context) => {
  const user = requireAuth(context);

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
};