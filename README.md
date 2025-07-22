# 🎓 Langara Course Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-38B2AC)](https://tailwindcss.com/)

> **Plan your Langara College course schedule efficiently with an intuitive and visual planner.**

Welcome to **CourSys v3** - the third iteration of the Langara Course Planner! This completely free and open-source tool helps students at Langara College plan their academic journey with ease.

🌐 **Live Demo:** [planner.langaracs.ca](https://planner.langaracs.ca)

---

## ✨ Features

### 🗓️ **Visual Course Planning**
- **Interactive Calendar View**: Drag-and-drop course scheduling with visual time conflict detection
- **Multiple Semester Support**: Plan courses across multiple terms and years
- **Real-time Updates**: Live course availability and seat tracking

### 📚 **Comprehensive Course Database**
- **Complete Course Catalog**: Access to all Langara College courses with detailed information
- **Course Prerequisites**: Clear prerequisite and restriction information
- **Transfer Credit Information**: See which courses transfer to BC universities
- **Course Descriptions**: Full course details, credits, and format information

### 🎯 **Smart Features**
- **Conflict Detection**: Automatic detection of schedule conflicts
- **Waitlist Tracking**: Monitor course waitlists and availability
- **Export Options**: Export your schedule to various formats
- **Mobile Responsive**: Plan courses on any device

### 🔍 **Advanced Search & Filter**
- **Multi-criteria Search**: Filter by subject, credits, time, instructor, and more
- **Transfer Credit Search**: Find courses that transfer to specific universities
- **Schedule Optimization**: Get suggestions for optimal course combinations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (18.0 or later)
- **Yarn** or **npm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DiskUtility/LangaraCoursePlanner.git
   cd LangaraCoursePlanner
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-----------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Build production version |
| `yarn build:prod` | Build production without SSL bypass |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint for code quality |

### Development Setup

```bash
# Install dependencies
yarn install

# Start development server (includes SSL certificate bypass)
yarn dev

# The app will be available at http://localhost:3000
```

### Environment Variables

For development, SSL certificate verification is automatically disabled. For production:

```bash
# Production build (with SSL verification)
yarn build:prod
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19.1.0 with Next.js 15.3.5
- **Styling**: Tailwind CSS 4.1.11 with custom components
- **UI Components**: Radix UI primitives
- **Calendar**: FullCalendar integration
- **Language**: TypeScript 5.7.3
- **Analytics**: Vercel Analytics & Speed Insights

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── courses/         # Course browsing and details
│   ├── planner/         # Course planning interface
│   ├── sections/        # Section management
│   ├── transfers/       # Transfer credit information
│   └── timetable/       # Timetable generation
├── components/          # Reusable UI components
│   ├── shared/          # Shared components
│   └── ui/              # Base UI components
├── lib/                 # Utility libraries
│   ├── api-config.ts    # API configuration and error handling
│   ├── courseApi.ts     # Course API client
│   └── planner-api.ts   # Planner API client
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

### API Integration

The application integrates with [LangaraCourseWatcher](https://github.com/langaracpsc/LangaraCourseWatcher), a REST API providing:
- Course information and schedules
- Real-time seat availability
- Transfer credit data
- Semester information

**Enhanced API Features:**
- ✅ Retry logic with exponential backoff
- ✅ SSL certificate handling for development
- ✅ Comprehensive error handling and logging
- ✅ Custom error classes for better debugging

---

## 📖 Usage Guide

### Getting Started
1. **Browse Courses**: Start by exploring available courses in the "Courses" section
2. **Plan Your Schedule**: Use the visual planner to add courses to your schedule
3. **Check Transfers**: View transfer credit information for your selected courses
4. **Generate Timetable**: Create and export your final course schedule

### Key Features

#### Course Search
- Use the search bar to find specific courses
- Filter by subject, term, credits, and availability
- View detailed course information including prerequisites

#### Schedule Planning
- Drag courses from the course list to your calendar
- Visual conflict detection highlights scheduling issues
- Multiple view options (week, month, agenda)

#### Transfer Credits
- Browse transfer agreements with BC universities
- Filter by destination institution
- View credit equivalencies and conditions

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Report Bugs**: Open an issue with detailed reproduction steps
- 💡 **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Help improve documentation and guides
- 💻 **Code Contributions**: Submit pull requests for bug fixes or features

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain consistent code formatting with ESLint
- Write descriptive commit messages

---

## 🐛 Known Issues & Solutions

### SSL Certificate Issues (Development)
If you encounter SSL certificate errors during development:
- The development server automatically bypasses SSL verification
- For manual setup: `export NODE_TLS_REJECT_UNAUTHORIZED=0`

### API Rate Limiting
- The API has built-in retry logic with exponential backoff
- Network errors are automatically retried up to 3 times

---

## 📝 Changelog

### v0.1.0 (Latest)
- ✅ **Enhanced API Error Handling**: Comprehensive retry logic and SSL certificate management
- ✅ **Improved User Experience**: Better error messages and loading states
- ✅ **Performance Optimizations**: Reduced API calls and improved caching
- ✅ **Mobile Responsiveness**: Enhanced mobile course planning experience

See [API Enhancement Details](./docs/API_ENHANCEMENTS.md) for technical details.

---

## 🏛️ Previous Versions

This is the **third version** of the Langara Course Planner. Previous versions:
- **v1 & v2**: [Original Repository](https://github.com/langaracpsc/LangaraCoursePlanner)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **[LangaraCourseWatcher](https://github.com/langaracpsc/LangaraCourseWatcher)** - REST API providing course data
- **[CourSys](https://coursys.sfu.ca/browse)** - Inspiration from Simon Fraser University's system
- **Langara Computer Science Club** - Original project maintainers
- **Open Source Community** - Various libraries and tools that make this possible

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/DiskUtility/LangaraCoursePlanner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DiskUtility/LangaraCoursePlanner/discussions)
- **Website**: [planner.langaracs.ca/about](https://planner.langaracs.ca/about)

---

<div align="center">
  <p>Made with ❤️ for Langara College students</p>
  <p>
    <a href="https://github.com/DiskUtility/LangaraCoursePlanner/stargazers">⭐ Star this project</a> •
    <a href="https://github.com/DiskUtility/LangaraCoursePlanner/issues">🐛 Report Bug</a> •
    <a href="https://github.com/DiskUtility/LangaraCoursePlanner/discussions">💬 Request Feature</a>
  </p>
</div>
