# 🧑‍💼 Job Portal Web Application

A full-stack Job Portal where recruiters can post jobs, users can apply with resumes, and admins/recruiters can view and manage applicants. Built using **Node.js**, **Express**, **MongoDB**, and **EJS** templating engine.

---

## 📌 Features

### 🔐 Authentication
- JWT-based login system
- Three user roles: **User**, **Recruiter**, and **Admin**
- Role-based access to features and pages

### 📝 Job Posting (Recruiters Only)
- Recruiters can:
  - Create jobs with Title, Description, Skills, Location, Salary
  - Edit or Close jobs
  - View list of jobs they’ve posted

### 🌍 Job Listing (All Users)
- All jobs are listed publicly with:
  - Title, Description, Skills, Location, Salary
  - “Apply” button (disabled if already applied)
  - “View Applicants” (for recruiters/admins only)

### 📤 Job Application (Users Only)
- Logged-in users can apply to jobs with:
  - Resume Upload (PDF)
  - Full Name, Email, Phone
  - Cover Letter
  - LinkedIn, GitHub, Portfolio
  - Experience (years)
- Prevents multiple applications to the same job

### 📂 Resume Management
- Resumes stored as **PDF buffer in MongoDB**
- Resumes viewable via inline PDF viewer (iframe)

### 🧑‍🤝‍🧑 View Applicants (Recruiters/Admins)
- View all applicants for a job with:
  - Name, Email, Experience, Cover Letter
  - Resume Preview
  - Optional LinkedIn, GitHub, Portfolio links

### 📎 Slug-based Job URLs
- Clean job URLs using slugs (e.g., `/jobs/apply/frontend-developer`)

---

## 🛠️ Tech Stack

| Frontend    | Backend     | Database | Authentication |
|-------------|-------------|----------|----------------|
| HTML + CSS + EJS | Node.js + Express | MongoDB (Mongoose) | JWT |
