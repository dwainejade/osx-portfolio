# macOS Portfolio

A modern, interactive portfolio website styled after the macOS desktop experience. Built with React, TypeScript, and Vite.

![MacOS Portfolio Preview](screenshot.png)

## Features

- ✨ **macOS-inspired UI**: Complete with desktop, dock, and resizable, draggable windows
- 🖥️ **Interactive Desktop**: Navigate through a simulated file system
- 🔲 **Window Management**: Open, close, minimize, and maximize windows just like on macOS
- 🚀 **Smooth Animations**: Powered by Framer Motion for fluid transitions
- 🧠 **State Management**: Utilizes Zustand for intuitive state handling
- 📱 **Responsive Design**: Adapts to different screen sizes
- 🎨 **Customizable**: Easily update with your own content

## Live Demo

[View Live Demo](https://your-portfolio-url.com)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/macos-portfolio.git
   cd macos-portfolio
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Customizing Your Portfolio

### Update Personal Information

Edit the following files to add your own information:

- `src/components/windows/AboutMeWindow.tsx`: Add your bio and personal info
- `src/components/windows/ProjectsWindow.tsx`: Add your projects
- `src/components/windows/ResumeWindow.tsx`: Add your skills and experience
- `src/components/windows/ContactWindow.tsx`: Update your contact details

### Customize Desktop and Dock

- `src/components/Dock.tsx`: Modify dock icons and applications
- `src/App.module.css`: Change desktop background
- `src/store/fileSystemStore.ts`: Customize your virtual file system

### Add Your Own Content

1. Place your images in the `public/assets/` directory
2. Update icon paths in the components
3. Modify CSS in the corresponding module files to style to your preferences

## Project Structure

```
src/
├── components/
│   ├── Desktop.tsx          # Desktop component
│   ├── Dock.tsx             # Dock component
│   ├── Window.tsx           # Window component
│   ├── WindowContainer.tsx  # Container for windows
│   └── windows/             # Individual window components
│       ├── AboutMeWindow.tsx
│       ├── ProjectsWindow.tsx
│       ├── ResumeWindow.tsx
│       └── ...
├── store/
│   ├── windowsStore.ts      # Window management state
│   ├── fileSystemStore.ts   # Virtual file system state
│   └── ...
├── hooks/
│   └── useWindowResize.ts   # Window resize hook
└── App.tsx                  # Main application component
```

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React-Rnd](https://github.com/bokuweb/react-rnd)

## Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory, which you can deploy to any static site hosting service like Netlify, Vercel, GitHub Pages, etc.

### Deployment Suggestions

- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the macOS desktop environment
- Icons used in the project are for demonstration purposes only
- Thanks to [React](https://reactjs.org/) and the open-source community for the amazing tools

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
