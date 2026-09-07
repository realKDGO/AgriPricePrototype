export const userService = { byRole: (users, role) => users.filter((user) => user.role === role), active: (users, role) => users.filter((user) => user.role === role && user.status === "Active") };
