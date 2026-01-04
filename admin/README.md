# Telegram Bot Admin Panel

React admin panel built with Vite, Ant Design, and React Router.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## Default Login Credentials

- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change the default password after first login!

## Features

- **Dashboard**: Overview statistics (users, balance, withdrawals)
- **Users Management**: View and search all users
- **User Details**: View user information and withdrawal history
- **Withdrawals Management**: View and manage withdrawal requests (approve/reject)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

