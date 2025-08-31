# Screenshot Guide for Test Data Engine

This guide will help you take professional screenshots for the README documentation.

## 📸 Required Screenshots

### 1. Main Interface (`main-interface.png`)
- **What to capture**: The main dashboard showing all sections
- **How to set up**:
  1. Start the application (`npm start`)
  2. Add a few sample columns to show the tree structure
  3. Make sure all main sections are visible
- **Focus**: Show the overall layout and main features

### 2. Column Management (`column-management.png`)
- **What to capture**: Tree-like column organization expanded
- **How to set up**:
  1. Add columns from different categories (Personal, Contact, Business, etc.)
  2. Expand 2-3 accordion sections to show the tree structure
  3. Show column actions (edit, delete, constraints buttons)
- **Focus**: Demonstrate the categorized column organization

### 3. Advanced Settings (`advanced-settings.png`)
- **What to capture**: Advanced data generation dialog
- **How to set up**:
  1. Click the "Advanced" button
  2. Open the dialog and navigate through different tabs
  3. Show relationships, sequences, or custom formats sections
- **Focus**: Show the advanced configuration options

### 4. Data Generation (`data-generation.png`)
- **What to capture**: Data generation section with export options
- **How to set up**:
  1. Generate some sample data
  2. Show the data table with generated records
  3. Display the export format options
- **Focus**: Show the data generation and export capabilities

### 5. API Testing (`api-testing.png`)
- **What to capture**: API testing interface
- **How to set up**:
  1. Click "Test Endpoint" button in header
  2. Configure a sample API request
  3. Show the request/response sections
- **Focus**: Demonstrate the API testing functionality

### 6. Import Data (`import-data.png`)
- **What to capture**: File import dialog
- **How to set up**:
  1. Click "Import File" button
  2. Show the drag-and-drop area
  3. Display supported file formats
- **Focus**: Show the import functionality

## 🛠️ Screenshot Tools

### macOS
- **Built-in**: `Cmd + Shift + 4` (area selection)
- **Preview App**: Open screenshot, crop, and save
- **Recommended**: Use Retina display for crisp images

### Windows
- **Snipping Tool**: Search for "Snipping Tool" in Start menu
- **Snip & Sketch**: `Win + Shift + S`
- **Recommended**: Use high DPI settings

### Browser Extensions
- **Full Page Screen Capture** (Chrome/Firefox)
- **Fireshot** (Chrome/Firefox)
- **Awesome Screenshot** (Chrome/Firefox)

## 📐 Best Practices

### Image Quality
- **Resolution**: At least 1920x1080 for main screenshots
- **Format**: PNG for screenshots, JPEG for photos
- **File Size**: Keep under 2MB per image
- **Aspect Ratio**: Maintain application proportions

### Composition
- **Browser Window**: Include browser chrome for context
- **White Space**: Include some padding around the content
- **Focus**: Highlight the main feature being demonstrated
- **Consistency**: Use similar browser window sizes

### Naming Convention
- Use lowercase with hyphens: `main-interface.png`
- Keep names descriptive but concise
- Match the names used in README.md

## 🚀 Quick Screenshot Script

```bash
# macOS - Take screenshot of specific area
screencapture -i screenshots/main-interface.png

# Windows - Use PowerShell
# (Run in PowerShell as Administrator)
# Add-Type -AssemblyName System.Windows.Forms
# Add-Type -AssemblyName System.Drawing
# $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
# $bitmap = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height
# $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
# $graphics.CopyFromScreen($screen.X, $screen.Y, 0, 0, $screen.Size)
# $bitmap.Save("screenshots\main-interface.png", [System.Drawing.Imaging.ImageFormat]::Png)
```

## 📋 Checklist Before Taking Screenshots

- [ ] Application is running (`npm start`)
- [ ] Browser window is appropriately sized (1200px+ width)
- [ ] Sample data is loaded to show functionality
- [ ] All relevant UI elements are visible
- [ ] Browser zoom is at 100%
- [ ] Dark/light mode is consistent
- [ ] No browser extensions interfering with layout

## 🔄 Updating Screenshots

1. Take new screenshots following this guide
2. Replace files in the `screenshots/` directory
3. Commit changes: `git add screenshots/ && git commit -m "docs: Update screenshots"`
4. Push to repository: `git push origin main`

## 📞 Need Help?

If you need assistance with taking screenshots or have questions about the process, please refer to the main README.md or create an issue in the repository.
