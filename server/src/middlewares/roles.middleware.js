module.exports = function allowedRoles(roles = []) {
  return function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ message: "Server error in role middleware" });
    }
  };
};
