# Loan Management Workflow

## Process Flow

```mermaid
%%{init: {"theme":"default"}}%%
flowchart TD
  A[Branch Creation] --> B[Employee Setup]
  B --> C[Lead Capture]
  C --> D[Borrower Created / KYC]
  D --> E[Loan Application Created]
  E --> F[Underwriting/Advisor Review]
  F -- Approve --> G[Pre-Disbursement Ops]
  F -- Reject --> H[Application Rejected]
  G --> I[Loan Disbursement]
  I --> J[Instalment Schedule Created]
  J --> K[Repayments]
  K --> L{Due Date Passed?}
  L -- No --> K
  L -- Yes --> M[Overdue - DPD Calculation]
  M --> N[Soft Collections]
  N -- No Response --> O[Hard Collections / Field Visit]
  O --> P[Legal: Notice / Case Filing]
  P --> Q[Settlement or Write-off]
  Q --> R[Loan Closed]

  style A fill:#0b63ce,color:#fff
  style I fill:#15a371,color:#fff
  style P fill:#ffb020,color:#000
  style Q fill:#d64545,color:#fff
```

## Key Stages

1. **Lead Management**: Capture and convert leads
2. **KYC & Onboarding**: Verify borrower identity
3. **Loan Application**: Create and submit applications
4. **Approval**: Advisor reviews and approves
5. **Disbursement**: Operations team disburses funds
6. **Repayment**: Track EMI payments
7. **Collections**: Handle overdue accounts
8. **Legal**: Manage legal cases for defaults
