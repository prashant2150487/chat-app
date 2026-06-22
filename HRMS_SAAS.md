# HRMS SaaS - Feature, Tech Stack, Roles, Database & API Reference

> **Design / planning document only.** No code - just features, tech stack,
> roles, dashboards, database tables (columns + descriptions), and APIs
> (with descriptions) for a **large-scale, multi-tenant HRMS SaaS** product.
>
> This document is **independent** of any other project in this workspace.
>
> An HRMS (Human Resource Management System) here is sold as **SaaS**: many
> companies (tenants) sign up, each with isolated data, their own employees,
> their own admins, and a subscription plan.

---

## 1. Product Overview

A multi-tenant HRMS SaaS that covers the full employee lifecycle - **Hire to
Retire** - plus the SaaS business layer (signup, subscription, billing).

**Core pillars**

| Pillar              | What it covers                                              |
| ------------------- | ---------------------------------------------------------- |
| Core HR             | Employee records, org structure, documents                |
| Time & Attendance   | Clock in/out, shifts, regularization, geo/biometric        |
| Leave               | Policies, balances, approvals, holidays                    |
| Payroll             | Salary structure, runs, payslips, statutory compliance     |
| Recruitment (ATS)   | Jobs, candidates, interviews, offers                       |
| Onboarding/Exit     | Pre-boarding, tasks, asset handover, FNF                    |
| Performance         | Goals/OKRs, reviews, 360 feedback, appraisals              |
| Learning (LMS)      | Courses, assignments, certifications                       |
| Engagement          | Surveys, announcements, rewards, helpdesk                  |
| Expenses & Assets   | Reimbursements, company asset tracking                     |
| Analytics           | Dashboards, reports, headcount, attrition                  |
| SaaS Platform       | Tenants, subscriptions, billing, integrations, audit       |

---

## 2. Tech Stack

**Frontend**

| Layer            | Choice                                                       |
| ---------------- | ----------------------------------------------------------- |
| Web app          | React + TypeScript, Next.js (SSR), Tailwind / shadcn-ui     |
| State / data     | React Query (server state) + Zustand/Redux (UI state)       |
| Mobile           | React Native (Expo) or Flutter                              |
| Charts           | Recharts / ECharts for dashboards                           |

**Backend**

| Layer            | Choice                                                       |
| ---------------- | ----------------------------------------------------------- |
| API style        | REST (OpenAPI) + GraphQL gateway (optional)                 |
| Runtime          | Node.js (NestJS) **or** Java (Spring Boot) **or** Go        |
| Architecture     | Microservices behind an API Gateway                         |
| Auth             | OAuth2 / OIDC, JWT access + refresh, SSO (SAML), MFA        |
| Async / events   | Kafka or RabbitMQ event bus                                 |
| Jobs / cron      | BullMQ / Temporal / Quartz (payroll runs, reminders)        |

**Data**

| Layer            | Choice                                                       |
| ---------------- | ----------------------------------------------------------- |
| Primary DB       | PostgreSQL (row-level multi-tenancy or schema-per-tenant)   |
| Cache / sessions | Redis                                                        |
| Search           | Elasticsearch / OpenSearch (employees, candidates, docs)    |
| File storage     | S3-compatible object storage                                |
| Data warehouse   | Snowflake / BigQuery for analytics                          |

**Platform / DevOps**

| Layer            | Choice                                                       |
| ---------------- | ----------------------------------------------------------- |
| Containers       | Docker + Kubernetes                                         |
| CI/CD            | GitHub Actions / GitLab CI                                  |
| Observability    | Prometheus + Grafana, ELK, OpenTelemetry, Sentry           |
| Infra            | Terraform (IaC), AWS/GCP/Azure                              |
| Secrets          | Vault / cloud secrets manager                              |

---

## 3. Multi-Tenancy Strategy

| Approach                  | When to use                                              |
| ------------------------- | ------------------------------------------------------- |
| **Shared DB, tenant_id**  | Default - cheapest, every table has `tenant_id`          |
| **Schema per tenant**     | Mid-size customers needing stronger isolation           |
| **Database per tenant**   | Enterprise / compliance-heavy customers                 |

**Rules**

- Every business table carries a `tenant_id` (a.k.a. `organization_id`).
- Every query is automatically scoped to the caller's tenant (middleware).
- A `Super Admin` (platform owner) can cross tenants; tenant users cannot.

---

## 4. Microservice Map

| Service                   | Responsibility                                           |
| ------------------------- | ------------------------------------------------------- |
| `api-gateway`             | Routing, auth, rate limit, tenant resolution            |
| `identity-service`        | Auth, users, roles, permissions, SSO, MFA               |
| `tenant-service`          | Organizations, subscriptions, plans, billing            |
| `employee-service`        | Employee records, org structure, documents              |
| `attendance-service`      | Clock in/out, shifts, regularization                    |
| `leave-service`           | Leave policies, requests, balances, holidays            |
| `payroll-service`         | Salary, payroll runs, payslips, statutory               |
| `recruitment-service`     | Jobs, candidates, interviews, offers (ATS)              |
| `onboarding-service`      | Onboarding/offboarding workflows & tasks                |
| `performance-service`     | Goals/OKRs, reviews, feedback, appraisals               |
| `learning-service`        | Courses, enrollments, certifications (LMS)              |
| `expense-service`         | Expense claims & reimbursements                         |
| `asset-service`           | Company asset allocation & tracking                     |
| `engagement-service`      | Surveys, announcements, rewards, helpdesk               |
| `notification-service`    | Email / SMS / push / in-app                             |
| `document-service`        | File storage, e-sign, templates                         |
| `analytics-service`       | Dashboards, reports, exports                            |
| `integration-service`     | 3rd-party integrations & webhooks                       |
| `audit-service`           | Audit logs, compliance trails                           |

> All public routes are prefixed `/api/v1/...` at the gateway.

---

## 5. Roles & RBAC

Roles are **scoped** (platform vs tenant) and backed by fine-grained
permissions (`module:action`, e.g. `payroll:run`, `leave:approve`).

| Role                | Scope    | Description                                              |
| ------------------- | -------- | ------------------------------------------------------- |
| Super Admin         | Platform | Owns the SaaS, manages all tenants & billing            |
| Support / Ops       | Platform | Platform support, read-mostly cross-tenant              |
| Org Admin (Owner)   | Tenant   | Full control of one company's HRMS                      |
| HR Admin            | Tenant   | Manages employees, payroll config, policies             |
| HR Manager          | Tenant   | Day-to-day HR ops (leave, attendance, recruitment)      |
| Payroll Manager     | Tenant   | Runs payroll, manages compensation                      |
| Recruiter           | Tenant   | Manages jobs, candidates, interviews                    |
| Department Manager  | Tenant   | Approves team leave/attendance, reviews team            |
| Team Lead           | Tenant   | Limited approvals for direct reports                    |
| Finance             | Tenant   | Expense approvals, payroll disbursement view            |
| Employee            | Tenant   | Self-service (profile, leave, payslips, claims)         |
| Auditor (read-only) | Tenant   | Read-only compliance access                             |

**Permission model**

- Roles → set of permissions.
- Custom roles allowed per tenant.
- Permissions checked at the gateway + service level.
- Data visibility narrowed by **org hierarchy** (a manager sees only their tree).

---

## 6. Dashboards (by role)

| Dashboard          | For                | Key widgets                                              |
| ------------------ | ------------------ | ------------------------------------------------------- |
| Platform Admin     | Super Admin        | Tenants, MRR/ARR, churn, active users, system health    |
| Org / HR Admin     | Org/HR Admin       | Headcount, attrition, new joiners, pending approvals    |
| Payroll Dashboard  | Payroll Manager    | Payroll cost, upcoming runs, errors, statutory dues     |
| Recruitment        | Recruiter / HR     | Open positions, pipeline funnel, time-to-hire           |
| Manager Dashboard  | Manager/Team Lead  | Team attendance, pending leave, goals, 1:1s             |
| Employee (ESS)     | Employee           | Leave balance, payslip, attendance, tasks, announcements|
| Finance Dashboard  | Finance            | Pending expenses, reimbursements, payroll disbursement  |
| Analytics / BI     | HR Admin/Exec      | Custom reports, trends, diversity, cost centers         |

> **ESS = Employee Self-Service. MSS = Manager Self-Service.**

---

# MODULES (Phase by Phase)

Build the early phases first (MVP), then scale outward.

---

## PHASE 1 - Tenancy, Auth & Identity

**Goal:** companies sign up, users log in securely, roles/permissions work.
**Owner:** `tenant-service` + `identity-service`

### Tables

**`organizations`** (tenant)

| Column         | Type     | Description                          |
| -------------- | -------- | ------------------------------------ |
| id             | uuid PK  | Tenant id                            |
| name           | string   | Company name                         |
| slug           | string   | Unique subdomain (acme.hrms.com)     |
| domain         | string?  | Verified email domain for SSO        |
| logo_url       | text?    | Company logo                         |
| country        | string   | Country (drives statutory rules)     |
| timezone       | string   | Default timezone                     |
| currency       | string   | Default currency                     |
| status         | enum     | TRIAL / ACTIVE / SUSPENDED / CLOSED  |
| created_at     | datetime | Created at                           |

**`users`** (login identity)

| Column          | Type     | Description                          |
| --------------- | -------- | ------------------------------------ |
| id              | uuid PK  | User id                              |
| tenant_id       | uuid FK  | Owning organization                  |
| email           | string   | Login email                          |
| password_hash   | string   | Hashed password                      |
| mfa_enabled     | bool     | MFA on/off                           |
| status          | enum     | INVITED / ACTIVE / DISABLED          |
| last_login_at   | datetime | Last login                           |
| created_at      | datetime | Created at                           |

**`roles`**, **`permissions`**, **`role_permissions`**, **`user_roles`**

| Table             | Key columns                              | Description                  |
| ----------------- | ---------------------------------------- | ---------------------------- |
| roles             | id, tenant_id, name, is_system           | Role definition              |
| permissions       | id, code (`module:action`), description  | Atomic permission            |
| role_permissions  | role_id, permission_id                   | Mapping                      |
| user_roles        | user_id, role_id, scope                  | Assigns roles to users       |

**`sessions`** / **`refresh_tokens`**, **`mfa_devices`**, **`sso_configs`**

| Table          | Key columns                                | Description               |
| -------------- | ------------------------------------------ | ------------------------- |
| refresh_tokens | id, user_id, token, expires_at, revoked    | Rotating refresh tokens   |
| mfa_devices    | id, user_id, type, secret, verified        | TOTP/SMS devices          |
| sso_configs    | id, tenant_id, provider, metadata          | SAML/OIDC per tenant      |

### APIs

| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | `/auth/signup`                | Create org + owner (start trial)     |
| POST   | `/auth/login`                 | Login, returns tokens                |
| POST   | `/auth/logout`                | Revoke session                       |
| POST   | `/auth/refresh-token`         | Rotate access token                  |
| POST   | `/auth/forgot-password`       | Start reset                          |
| POST   | `/auth/reset-password`        | Set new password                     |
| POST   | `/auth/mfa/enable`            | Enable MFA                           |
| POST   | `/auth/mfa/verify`            | Verify MFA code                      |
| GET    | `/auth/me`                    | Current user + permissions           |
| POST   | `/auth/sso/login`             | SSO login (SAML/OIDC)                |
| GET    | `/roles`                      | List roles                           |
| POST   | `/roles`                      | Create custom role                   |
| PUT    | `/roles/:id`                  | Update role + permissions            |
| POST   | `/users/invite`              | Invite a user                        |
| GET    | `/users`                      | List tenant users                    |
| PUT    | `/users/:id/roles`            | Assign roles                         |

---

## PHASE 2 - Core HR (Employees & Org Structure)

**Goal:** the source of truth for employees and the org chart.
**Owner:** `employee-service`

### Tables

**`employees`**

| Column            | Type     | Description                              |
| ----------------- | -------- | ---------------------------------------- |
| id                | uuid PK  | Employee id                              |
| tenant_id         | uuid FK  | Organization                             |
| user_id           | uuid? FK | Linked login user (null for non-login)   |
| employee_code     | string   | Human-readable id (EMP-0001)             |
| first_name        | string   | First name                               |
| last_name         | string   | Last name                                |
| work_email        | string   | Work email                               |
| personal_email    | string?  | Personal email                           |
| phone             | string?  | Phone                                    |
| gender            | enum?    | Gender                                   |
| date_of_birth     | date?    | DOB                                      |
| department_id     | uuid? FK | Department                               |
| designation_id    | uuid? FK | Job title                                |
| location_id       | uuid? FK | Office location                          |
| manager_id        | uuid? FK | Reporting manager (self-ref)             |
| employment_type   | enum     | FULL_TIME / PART_TIME / CONTRACT / INTERN|
| date_of_joining   | date     | Join date                                |
| date_of_exit      | date?    | Exit date                                |
| status            | enum     | ACTIVE / ON_LEAVE / RESIGNED / TERMINATED|
| created_at        | datetime | Created at                               |

**`departments`**, **`designations`**, **`locations`**, **`teams`**

| Table        | Key columns                                  | Description            |
| ------------ | -------------------------------------------- | ---------------------- |
| departments  | id, tenant_id, name, parent_id, head_id      | Department tree        |
| designations | id, tenant_id, title, level, grade           | Job titles / grades    |
| locations    | id, tenant_id, name, address, timezone       | Offices                |
| teams        | id, tenant_id, name, department_id, lead_id   | Teams within dept      |

**`employee_documents`**, **`employee_emergency_contacts`**, **`employee_bank_details`**

| Table                       | Key columns                              | Description           |
| --------------------------- | ---------------------------------------- | --------------------- |
| employee_documents          | id, employee_id, type, file_url, status  | Contracts, IDs, etc.  |
| employee_emergency_contacts | id, employee_id, name, relation, phone   | Emergency contacts    |
| employee_bank_details       | id, employee_id, account_no, ifsc, bank  | For payroll           |

### APIs

| Method | Path                          | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| POST   | `/employees`                  | Create employee                   |
| GET    | `/employees`                  | List/search/filter employees      |
| GET    | `/employees/:id`              | Employee profile                  |
| PUT    | `/employees/:id`              | Update employee                   |
| DELETE | `/employees/:id`              | Deactivate employee               |
| GET    | `/employees/:id/org-chart`    | Reporting tree                    |
| POST   | `/employees/:id/documents`    | Upload document                   |
| GET    | `/departments`                | List departments                  |
| POST   | `/departments`                | Create department                 |
| GET    | `/designations`               | List designations                 |
| GET    | `/locations`                  | List locations                    |
| GET    | `/org-chart`                  | Full company org chart            |

---

## PHASE 3 - Attendance & Time Tracking

**Goal:** track working hours, shifts, and regularization.
**Owner:** `attendance-service`

### Tables

**`attendance_records`**

| Column        | Type     | Description                          |
| ------------- | -------- | ------------------------------------ |
| id            | uuid PK  | Record id                            |
| tenant_id     | uuid FK  | Org                                  |
| employee_id   | uuid FK  | Employee                             |
| date          | date     | Day                                  |
| check_in      | datetime?| First check-in                      |
| check_out     | datetime?| Last check-out                      |
| work_hours    | decimal  | Computed hours                       |
| status        | enum     | PRESENT / ABSENT / HALF_DAY / WFH    |
| source        | enum     | WEB / MOBILE / BIOMETRIC / GEO       |
| created_at    | datetime | Created at                           |

**`shifts`**, **`employee_shifts`**, **`regularizations`**

| Table             | Key columns                                   | Description              |
| ----------------- | --------------------------------------------- | ------------------------ |
| shifts            | id, tenant_id, name, start_time, end_time     | Shift definitions        |
| employee_shifts   | id, employee_id, shift_id, from, to           | Shift assignment         |
| regularizations   | id, employee_id, date, reason, status         | Fix missed punches       |

### APIs

| Method | Path                              | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| POST   | `/attendance/check-in`            | Clock in (geo/IP optional)   |
| POST   | `/attendance/check-out`           | Clock out                    |
| GET    | `/attendance/me`                  | My attendance                |
| GET    | `/attendance`                     | Team/org attendance (filter) |
| POST   | `/attendance/regularize`          | Request regularization       |
| PUT    | `/attendance/regularize/:id`      | Approve/reject regularization|
| GET    | `/shifts`                         | List shifts                  |
| POST   | `/shifts/assign`                  | Assign shift                 |

---

## PHASE 4 - Leave Management

**Goal:** leave policies, balances, and approval workflows.
**Owner:** `leave-service`

### Tables

**`leave_types`**, **`leave_policies`**, **`leave_balances`**, **`leave_requests`**, **`holidays`**

| Table          | Key columns                                              | Description              |
| -------------- | ------------------------------------------------------- | ------------------------ |
| leave_types    | id, tenant_id, name, paid, code                          | Casual/Sick/Earned, etc. |
| leave_policies | id, tenant_id, leave_type_id, accrual, max, carry_fwd    | Rules per type           |
| leave_balances | id, employee_id, leave_type_id, balance, used, year      | Per-employee balance     |
| leave_requests | id, employee_id, leave_type_id, from, to, days, status, approver_id, reason | A request |
| holidays       | id, tenant_id, name, date, location_id                   | Holiday calendar         |

`leave_requests.status`: PENDING / APPROVED / REJECTED / CANCELLED.

### APIs

| Method | Path                         | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/leave/balances`            | My leave balances            |
| POST   | `/leave/requests`            | Apply for leave              |
| GET    | `/leave/requests`            | List requests (filter)       |
| PUT    | `/leave/requests/:id/approve`| Approve                      |
| PUT    | `/leave/requests/:id/reject` | Reject                       |
| DELETE | `/leave/requests/:id`        | Cancel                       |
| GET    | `/leave/types`               | List leave types             |
| POST   | `/leave/policies`            | Create policy                |
| GET    | `/holidays`                  | Holiday calendar             |

---

## PHASE 5 - Payroll & Compensation

**Goal:** salary structures, payroll runs, payslips, statutory compliance.
**Owner:** `payroll-service`

### Tables

**`salary_structures`**, **`salary_components`**, **`payroll_runs`**, **`payslips`**, **`payslip_items`**

| Table              | Key columns                                            | Description                 |
| ------------------ | ----------------------------------------------------- | --------------------------- |
| salary_components  | id, tenant_id, name, type (EARNING/DEDUCTION), taxable | Basic, HRA, PF, Tax, etc.   |
| salary_structures  | id, employee_id, ctc, effective_from                   | Employee comp               |
| structure_items    | id, structure_id, component_id, amount/formula         | Component breakdown         |
| payroll_runs       | id, tenant_id, period (month/year), status, total      | A monthly run               |
| payslips           | id, payroll_run_id, employee_id, gross, net, status    | Per-employee payslip        |
| payslip_items      | id, payslip_id, component_id, amount                   | Line items                  |

`payroll_runs.status`: DRAFT / PROCESSING / APPROVED / PAID / FAILED.

### APIs

| Method | Path                              | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/payroll/components`             | List salary components       |
| POST   | `/payroll/structures`             | Set employee salary structure|
| POST   | `/payroll/runs`                   | Start a payroll run          |
| POST   | `/payroll/runs/:id/process`       | Process/calculate            |
| POST   | `/payroll/runs/:id/approve`       | Approve run                  |
| POST   | `/payroll/runs/:id/disburse`      | Mark as paid                 |
| GET    | `/payroll/payslips/me`            | My payslips                  |
| GET    | `/payroll/payslips/:id`           | Get payslip (PDF)            |
| GET    | `/payroll/reports/statutory`      | PF/ESI/Tax reports           |

---

## PHASE 6 - Recruitment (ATS)

**Goal:** manage jobs, candidates, interviews, and offers.
**Owner:** `recruitment-service`

### Tables

**`job_openings`**, **`candidates`**, **`applications`**, **`interviews`**, **`offers`**

| Table         | Key columns                                                  | Description            |
| ------------- | ----------------------------------------------------------- | ---------------------- |
| job_openings  | id, tenant_id, title, department_id, openings, status        | Requisition            |
| candidates    | id, tenant_id, name, email, phone, resume_url, source        | Talent pool            |
| applications  | id, job_id, candidate_id, stage, status, rating              | Candidate ↔ job        |
| interviews    | id, application_id, round, interviewer_id, scheduled_at, feedback, result | Interview |
| offers        | id, application_id, ctc, joining_date, status                | Offer letter           |

`applications.stage`: APPLIED / SCREENING / INTERVIEW / OFFER / HIRED / REJECTED.

### APIs

| Method | Path                                | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| POST   | `/jobs`                             | Create job opening          |
| GET    | `/jobs`                             | List jobs                   |
| GET    | `/jobs/:id/pipeline`                | Candidate pipeline          |
| POST   | `/candidates`                       | Add candidate               |
| POST   | `/applications`                     | Apply candidate to job      |
| PUT    | `/applications/:id/stage`           | Move stage                  |
| POST   | `/interviews`                       | Schedule interview          |
| POST   | `/interviews/:id/feedback`          | Submit feedback             |
| POST   | `/offers`                           | Create offer                |
| PUT    | `/offers/:id/status`                | Accept/decline offer        |

---

## PHASE 7 - Onboarding & Offboarding

**Goal:** structured task workflows for joining and exit.
**Owner:** `onboarding-service`

### Tables

**`workflows`**, **`workflow_tasks`**, **`onboarding_instances`**, **`task_assignments`**

| Table                | Key columns                                          | Description              |
| -------------------- | --------------------------------------------------- | ------------------------ |
| workflows            | id, tenant_id, type (ONBOARD/OFFBOARD), name         | Template                 |
| workflow_tasks       | id, workflow_id, title, owner_role, due_offset_days  | Template tasks           |
| onboarding_instances | id, employee_id, workflow_id, status                 | A run for one employee   |
| task_assignments     | id, instance_id, task, assignee_id, status, due_date | Actual tasks             |

### APIs

| Method | Path                               | Description                 |
| ------ | ---------------------------------- | --------------------------- |
| POST   | `/workflows`                       | Create workflow template    |
| POST   | `/onboarding/start`                | Start onboarding for hire   |
| POST   | `/offboarding/start`               | Start exit process          |
| GET    | `/tasks/me`                        | My assigned tasks           |
| PUT    | `/tasks/:id/complete`              | Complete a task             |

---

## PHASE 8 - Performance Management

**Goal:** goals/OKRs, reviews, 360 feedback, appraisals.
**Owner:** `performance-service`

### Tables

**`goals`**, **`review_cycles`**, **`reviews`**, **`feedback`**, **`appraisals`**

| Table         | Key columns                                            | Description              |
| ------------- | ----------------------------------------------------- | ------------------------ |
| goals         | id, employee_id, title, type (OKR/KPI), target, progress, status | Goals/OKRs   |
| review_cycles | id, tenant_id, name, period, status                    | Appraisal cycle          |
| reviews       | id, cycle_id, employee_id, reviewer_id, score, status  | Manager/self review      |
| feedback      | id, subject_id, giver_id, type (PEER/360), content     | 360 feedback             |
| appraisals    | id, cycle_id, employee_id, rating, hike_pct, new_ctc   | Outcome                  |

### APIs

| Method | Path                          | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| POST   | `/goals`                      | Create goal/OKR              |
| PUT    | `/goals/:id/progress`         | Update progress              |
| POST   | `/review-cycles`              | Start a cycle                |
| POST   | `/reviews`                    | Submit review                |
| POST   | `/feedback`                   | Give 360 feedback            |
| GET    | `/appraisals/me`              | My appraisal result          |

---

## PHASE 9 - Learning & Development (LMS)

**Goal:** courses, enrollments, certifications.
**Owner:** `learning-service`

### Tables

**`courses`**, **`lessons`**, **`enrollments`**, **`certifications`**

| Table          | Key columns                                       | Description           |
| -------------- | ------------------------------------------------- | --------------------- |
| courses        | id, tenant_id, title, category, duration          | Course                |
| lessons        | id, course_id, title, content_url, order          | Lesson/module         |
| enrollments    | id, course_id, employee_id, progress, status      | Who's taking what     |
| certifications | id, employee_id, course_id, issued_at, expires_at | Earned certs          |

### APIs

| Method | Path                          | Description              |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/courses`                    | List courses            |
| POST   | `/courses`                    | Create course           |
| POST   | `/courses/:id/enroll`         | Enroll employee(s)      |
| PUT    | `/enrollments/:id/progress`   | Update progress         |
| GET    | `/certifications/me`          | My certifications       |

---

## PHASE 10 - Expenses & Reimbursements

**Goal:** employees claim expenses; finance approves & reimburses.
**Owner:** `expense-service`

### Tables

**`expense_claims`**, **`expense_items`**, **`expense_categories`**

| Table              | Key columns                                          | Description           |
| ------------------ | --------------------------------------------------- | --------------------- |
| expense_categories | id, tenant_id, name, max_limit                       | Travel, food, etc.    |
| expense_claims     | id, employee_id, total, status, approver_id          | A claim               |
| expense_items      | id, claim_id, category_id, amount, receipt_url, date | Line items            |

`expense_claims.status`: DRAFT / SUBMITTED / APPROVED / REJECTED / REIMBURSED.

### APIs

| Method | Path                            | Description              |
| ------ | ------------------------------- | ----------------------- |
| POST   | `/expenses`                     | Submit a claim          |
| GET    | `/expenses/me`                  | My claims               |
| PUT    | `/expenses/:id/approve`         | Approve claim           |
| PUT    | `/expenses/:id/reject`          | Reject claim            |
| POST   | `/expenses/:id/reimburse`       | Mark reimbursed         |

---

## PHASE 11 - Asset Management

**Goal:** track company assets assigned to employees.
**Owner:** `asset-service`

### Tables

**`assets`**, **`asset_assignments`**

| Table             | Key columns                                       | Description           |
| ----------------- | ------------------------------------------------- | --------------------- |
| assets            | id, tenant_id, name, type, serial_no, status      | Laptop, phone, etc.   |
| asset_assignments | id, asset_id, employee_id, assigned_at, returned_at | Allocation history  |

### APIs

| Method | Path                          | Description              |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/assets`                     | List assets             |
| POST   | `/assets`                     | Add asset               |
| POST   | `/assets/:id/assign`          | Assign to employee      |
| POST   | `/assets/:id/return`          | Return asset            |

---

## PHASE 12 - Engagement (Surveys, Announcements, Rewards, Helpdesk)

**Goal:** keep employees engaged and supported.
**Owner:** `engagement-service`

### Tables

| Table          | Key columns                                       | Description              |
| -------------- | ------------------------------------------------- | ------------------------ |
| announcements  | id, tenant_id, title, body, audience, published_at | Company announcements   |
| surveys        | id, tenant_id, title, anonymous, status            | eNPS/pulse surveys      |
| survey_responses | id, survey_id, employee_id, answers              | Responses               |
| rewards        | id, tenant_id, from_id, to_id, points, message     | Kudos / recognition     |
| tickets        | id, tenant_id, raiser_id, category, status, priority | HR helpdesk tickets   |

### APIs

| Method | Path                          | Description              |
| ------ | ----------------------------- | ----------------------- |
| POST   | `/announcements`              | Post announcement       |
| GET    | `/announcements`              | List announcements      |
| POST   | `/surveys`                    | Create survey           |
| POST   | `/surveys/:id/respond`        | Submit response         |
| POST   | `/rewards`                    | Give kudos              |
| POST   | `/tickets`                    | Raise HR ticket         |
| PUT    | `/tickets/:id/status`         | Update ticket status    |

---

## PHASE 13 - Notifications & Documents

**Goal:** reach users on every channel; manage documents & e-sign.
**Owner:** `notification-service` + `document-service`

### Tables

| Table          | Key columns                                       | Description              |
| -------------- | ------------------------------------------------- | ------------------------ |
| notifications  | id, tenant_id, user_id, type, title, body, is_read | In-app notifications    |
| notif_prefs    | id, user_id, channel, enabled                      | Per-channel preferences |
| documents      | id, tenant_id, owner_id, type, file_url, status    | Files & templates       |
| signatures     | id, document_id, signer_id, status, signed_at      | E-signature requests    |

### APIs

| Method | Path                          | Description              |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/notifications`              | List notifications      |
| PUT    | `/notifications/read`         | Mark read               |
| PUT    | `/notifications/preferences`  | Update channels         |
| POST   | `/documents`                  | Upload document         |
| POST   | `/documents/:id/sign`         | Request/complete e-sign |

---

## PHASE 14 - Analytics & Reporting

**Goal:** dashboards, custom reports, and exports.
**Owner:** `analytics-service` (reads from warehouse)

### Tables

Reads from a **data warehouse** + materialized views. Stores report defs:

| Table         | Key columns                                  | Description           |
| ------------- | -------------------------------------------- | --------------------- |
| report_defs   | id, tenant_id, name, query/config, schedule  | Saved reports         |
| dashboards    | id, tenant_id, name, layout (widgets)        | Custom dashboards     |

### APIs

| Method | Path                              | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/analytics/headcount`            | Headcount over time          |
| GET    | `/analytics/attrition`            | Attrition rate               |
| GET    | `/analytics/attendance`           | Attendance trends            |
| GET    | `/analytics/payroll-cost`         | Payroll cost breakdown       |
| GET    | `/analytics/recruitment-funnel`   | Hiring funnel                |
| POST   | `/reports`                        | Create custom report         |
| GET    | `/reports/:id/export`             | Export (CSV/Excel/PDF)       |

---

## PHASE 15 - SaaS Platform: Subscriptions & Billing

**Goal:** the business layer - plans, subscriptions, invoices, usage.
**Owner:** `tenant-service` (platform/Super Admin)

### Tables

**`plans`**, **`subscriptions`**, **`invoices`**, **`usage_records`**

| Table         | Key columns                                                | Description              |
| ------------- | --------------------------------------------------------- | ------------------------ |
| plans         | id, name, price, billing_cycle, features, seat_limit       | Free/Pro/Enterprise      |
| subscriptions | id, tenant_id, plan_id, status, seats, current_period_end  | Tenant's subscription    |
| invoices      | id, tenant_id, amount, status, due_date, pdf_url           | Billing invoices         |
| usage_records | id, tenant_id, metric, value, period                       | Metered usage            |
| payment_methods | id, tenant_id, type, last4, gateway_ref                  | Cards / bank             |

`subscriptions.status`: TRIALING / ACTIVE / PAST_DUE / CANCELLED.

### APIs

| Method | Path                            | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| GET    | `/billing/plans`                | List plans                   |
| POST   | `/billing/subscribe`            | Subscribe / change plan      |
| POST   | `/billing/cancel`               | Cancel subscription          |
| GET    | `/billing/invoices`             | List invoices                |
| POST   | `/billing/payment-method`       | Add/update payment method    |
| POST   | `/webhooks/payment`             | Payment gateway webhook      |
| GET    | `/admin/tenants`                | (Super Admin) list tenants   |
| PUT    | `/admin/tenants/:id/suspend`    | Suspend a tenant             |

---

## PHASE 16 - Integrations, Audit & Compliance

**Goal:** connect to external tools; keep full audit trails.
**Owner:** `integration-service` + `audit-service`

### Tables

| Table         | Key columns                                          | Description              |
| ------------- | --------------------------------------------------- | ------------------------ |
| integrations  | id, tenant_id, provider, config, status              | Slack, Google, biometric |
| webhooks      | id, tenant_id, event, target_url, secret, active     | Outbound webhooks        |
| api_keys      | id, tenant_id, key_hash, scopes, last_used           | Programmatic access      |
| audit_logs    | id, tenant_id, actor_id, action, entity, before/after, ip, created_at | Audit trail |

### APIs

| Method | Path                          | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/integrations`               | List integrations            |
| POST   | `/integrations/:provider`     | Connect an integration       |
| POST   | `/webhooks`                   | Register a webhook           |
| POST   | `/api-keys`                   | Generate API key             |
| GET    | `/audit-logs`                 | Query audit logs             |

---

## 7. Cross-Cutting Concerns (Scale & Security)

| Area               | What to add                                                  |
| ------------------ | ----------------------------------------------------------- |
| Tenant isolation   | `tenant_id` scoping everywhere + row-level security         |
| AuthZ              | RBAC + ABAC (org hierarchy) checks at gateway & services    |
| Rate limiting      | Per-tenant / per-user quotas (Redis)                        |
| Idempotency        | Idempotency keys on payroll/billing mutations               |
| Async workflows    | Event bus for payroll runs, onboarding, notifications       |
| Caching            | Redis for hot reads (employee, permissions)                 |
| Data privacy       | GDPR/PII handling, data export & "right to be forgotten"    |
| Encryption         | At rest (DB/S3) + in transit (TLS); field-level for PII     |
| Observability      | Tracing, metrics, centralized logs per service              |
| Backups & DR       | Automated backups, point-in-time recovery, multi-region     |
| Localization       | Multi-currency, multi-language, country statutory rules     |

---

## 8. Build / Scale Roadmap

**MVP (Phases 1-5)**
Tenancy + Auth → Core HR → Attendance → Leave → Payroll

**V2 (Phases 6-10)**
Recruitment (ATS) → Onboarding/Exit → Performance → Learning → Expenses

**V3 (Phases 11-14)**
Assets → Engagement → Notifications/Documents → Analytics

**V4 (Phases 15-16 + cross-cutting)**
Subscriptions & Billing → Integrations/Audit → Security & scale hardening

---

## 9. System Architecture (High Level)

```
        Web (Next.js)      Mobile (React Native)
              │                     │
              └──────────┬──────────┘
                         ▼
                    API Gateway
        (auth, tenant resolution, rate limit, routing)
                         │
   ┌─────────────┬───────┼────────────┬──────────────┐
   ▼             ▼       ▼            ▼              ▼
identity     employee  attendance   leave        payroll
tenant       recruitment onboarding performance  learning
expense      asset     engagement   notification document
analytics    integration audit
   │             │       │            │              │
   └─────────────┴───────┴────────────┴──────────────┘
                         │
                  Event Bus (Kafka)
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   PostgreSQL          Redis        Object Storage (S3)
   (per service)     (cache)        Elasticsearch / Warehouse
```

- **Sync** requests flow through the gateway to services.
- **Async** events (e.g. `employee.created`, `payroll.completed`,
  `leave.approved`) flow over Kafka so modules stay decoupled.
- Each service owns its **own schema/DB**; cross-service reads happen via APIs
  or the analytics warehouse, never direct table access.
