# Project Dashboard

A professional dashboard for managing and showcasing your vibe coded projects with a sleek design, smooth animations, and intuitive interactions.

![Project Dashboard](https://via.placeholder.com/800x400/667eea/ffffff?text=Project+Dashboard+Demo)

## ✨ Features

- **📋 Project Management**: Add, edit, and organize your projects
- **🖼️ Visual Cards**: Beautiful project cards with screenshots
- **🔍 Detailed View**: Expandable modals with comprehensive project information
- **🚀 Quick Launch**: Hover-to-reveal launch buttons for instant project access
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **💾 Local Storage**: Projects persist between sessions
- **🎨 Modern UI**: Professional design with subtle animations and transitions

## 🚀 Quick Start

### Demo
Open `demo.html` in your browser to see the dashboard with sample projects.

### Development
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Testing
1. **Install Playwright browsers:**
   ```bash
   npm run install-playwright
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Run tests with UI:**
   ```bash
   npm run test:ui
   ```

## 🎯 Usage

### Adding Projects
1. Click the **"Add Project"** button
2. Fill in the project details:
   - **Name**: Your project title
   - **Description**: Brief overview of the project
   - **URL**: Live project URL
   - **Tools**: Technologies used (comma-separated)
3. Click **"Add Project"** to save

### Viewing Projects
- Click any project card to open the detailed view
- View larger screenshots, full descriptions, and technology stack
- Hover over screenshots to reveal the launch button

### Editing Projects
1. Open a project's detailed view
2. Click the **"Edit"** button
3. Modify any project information
4. Click **"Save Changes"**

### Launching Projects
- In the detailed view, hover over the screenshot
- Click the **"LAUNCH"** button to open the project in a new tab

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with Flexbox/Grid, Font Awesome icons
- **Storage**: localStorage for persistence
- **Testing**: Playwright for end-to-end testing
- **Dev Server**: live-server for local development

## 🎨 Design Features

- **Gradient Backgrounds**: Beautiful purple-to-blue gradients
- **Smooth Animations**: CSS transitions and hover effects
- **Modal Overlays**: Professional modal design with backdrop blur
- **Responsive Grid**: Adaptive project card layout
- **Loading States**: Visual feedback during operations
- **Toast Notifications**: Success/error feedback messages

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop**: Multi-column grid layout with hover effects
- **Tablet**: Adaptive grid with touch-friendly interactions
- **Mobile**: Single-column layout with optimized modals

## 🧪 Testing

The project includes comprehensive Playwright tests covering:
- ✅ Modal interactions (open/close)
- ✅ Form submissions and validation
- ✅ Project CRUD operations
- ✅ Navigation and routing
- ✅ Responsive behavior
- ✅ Local storage persistence

## 🚀 Deployment

To deploy the dashboard:

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):
   - Upload the files to your hosting provider
   - Set `index.html` as the entry point

2. **Custom Server**:
   - Serve the files with any web server
   - Ensure proper MIME types for CSS/JS files

## 📝 Project Structure

```
project-dashboard/
├── index.html          # Main application
├── demo.html           # Demo with sample projects
├── styles.css          # All styling and animations
├── script.js           # Main application logic
├── package.json        # Dependencies and scripts
├── playwright.config.js # Test configuration
├── tests/              # Test files
│   ├── dashboard.spec.js
│   └── dashboard-simple.spec.js
└── README.md           # This file
```

## 🎮 Keyboard Shortcuts

- **Ctrl+T**: Open add project modal (for testing)
- **Ctrl+Shift+C**: Clear all projects (for testing)
- **Escape**: Close any open modal

## 🐛 Troubleshooting

### Projects Not Saving
- Check browser localStorage support
- Ensure JavaScript is enabled
- Clear browser cache if needed

### Tests Failing
- Ensure all dependencies are installed: `npm install`
- Install Playwright browsers: `npm run install-playwright`
- Check that no other server is running on port 3000

### Styling Issues
- Verify Font Awesome and Google Fonts are loading
- Check network connectivity for external resources
- Ensure CSS file is properly linked

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Font Awesome** for beautiful icons
- **Google Fonts** for Inter typeface
- **Playwright** for robust testing framework
- **live-server** for development convenience

---

Built with ❤️ for managing your vibe coded projects!
