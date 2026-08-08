# 📋 TaskBoard Workspace

A modern, full-stack Kanban task management application built with FastAPI, React, PostgreSQL, and Tailwind CSS.

## ✨ Key Features
- 🔐 **JWT Authentication**: User registration, login, and secure session management.
- 📌 **Dynamic Boards**: Create, switch, and delete custom project boards.
- 📋 **List & Card Columns**: Organize tasks under custom workflow lists (*To Do*, *In Progress*, *Done*).
- 🖱️ **Drag and Drop**: Smooth HTML5 drag-and-drop card movements between columns.
- ⚡ **Optimistic UI Updates**: Immediate input resets, loading spinners, and double-click prevention.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Axios
- **Backend**: FastAPI (Python), SQLAlchemy (Async), Pydantic
- **Database**: PostgreSQL
- **Security**: Passlib (Bcrypt), PyJWT

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database running locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

pip install -r requirements.txt


## 📷 Preview

![TaskBoard Dashboard](./LogIn.jpg)
![TaskBoard Dashboard](./TaskBoard (2).JPG)
