export const SidebarMenu = [
  { id: "dash", label: "Dashboard", icon: "chart-pie", path: "/dashboard", roles: ["ADMIN","MANAGER","COUNSELLOR","COLLECTION","ADVISOR","OPERATION","LEGAL"] },
  { id: "borrowers", label: "Borrowers", icon: "users", path: "/borrowers", roles: ["ADMIN","MANAGER","COUNSELLOR","ADVISOR","OPERATION","COLLECTION"] },
  { id: "loans", label: "Loans", icon: "file-text", path: "/loans", roles: ["ADMIN","MANAGER","ADVISOR","OPERATION"],
    children: [
      { id: "applications", label: "Applications", path: "/loans/applications", roles: ["ADVISOR","MANAGER","ADMIN"] },
      { id: "create", label: "New Loan", path: "/loans/create", roles: ["COUNSELLOR","OPERATION"] }
    ]
  },
  { id: "disbursement", label: "Disbursement", icon: "send", path: "/disbursement", roles: ["OPERATION","MANAGER","ADMIN"] },
  { id: "collections", label: "Collections", icon: "credit-card", path: "/collections", roles: ["COLLECTION","MANAGER","ADMIN"],
    children: [
      { id: "daily", label: "Daily", path: "/collections/daily" },
      { id: "overdue", label: "Overdue", path: "/collections/overdue" }
    ]
  },
  { id: "legal", label: "Legal", icon: "gavel", path: "/legal", roles: ["LEGAL","MANAGER","ADMIN"] },
  { id: "reports", label: "Reports", icon: "bar-chart-2", path: "/reports", roles: ["MANAGER","ADMIN","ADVISOR","OPERATION"],
    children: [
      { id: "portfolio", label: "Portfolio Report", path: "/reports/portfolio" },
      { id: "aging", label: "Aging Summary", path: "/reports/aging" },
      { id: "collection", label: "Collection Report", path: "/reports/collection" },
      { id: "disbursement", label: "Disbursement Report", path: "/reports/disbursement" },
      { id: "npa", label: "NPA Tracker", path: "/reports/npa" },
      { id: "legal", label: "Legal Report", path: "/reports/legal" },
      { id: "agent-performance", label: "Agent Performance", path: "/reports/agent-performance" },
      { id: "branch-performance", label: "Branch Performance", path: "/reports/branch-performance" },
      { id: "borrowers", label: "Borrower Master Export", path: "/reports/borrowers" }
    ]
  },
  { id: "settings", label: "Settings", icon: "settings", path: "/settings", roles: ["ADMIN"] }
];
