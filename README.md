# Test Data Engine

A comprehensive web application for generating realistic test data with advanced schema management, data generation capabilities, and powerful export options. Perfect for developers, QA engineers, and data scientists who need high-quality test data for their applications.

![Test Data Engine](https://img.shields.io/badge/React-18.2.0-blue) ![Material--UI](https://img.shields.io/badge/Material--UI-5.14.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![Faker.js](https://img.shields.io/badge/Faker.js-8.0+-green)

try it:

https://stackblitz.com/github/Avenger435/Test-Data-Engine?file=package-lock.json,package.json


## ✨ Features

### 🎯 Core Functionality
- **Dynamic Schema Builder**: Create custom data schemas with an intuitive tree-like interface
- **Real-time Data Generation**: Generate thousands of records instantly with realistic data
- **Advanced Data Types**: Support for 50+ data types including custom formats and sequences
- **Smart Categorization**: Automatic organization of columns into logical categories

### 📊 Column Management
- **Tree-like Organization**: Columns are automatically categorized into:
  - 🧑 **Personal Information** (names, titles, etc.)
  - 📧 **Contact Information** (emails, phones)
  - 🏢 **Business Information** (companies, salaries)
  - 📍 **Location Information** (addresses, cities)
  - 💻 **Technical/IDs** (UUIDs, auto-increment)
  - 🔧 **Other Fields** (custom fields)
- **Column Constraints**: Set validation rules, length limits, and custom patterns
- **Bulk Operations**: Add, edit, delete, and reorder columns with ease

### 🔧 Advanced Features
- **Templates System**: Pre-built templates for common use cases (User Management, E-commerce, etc.)
- **Preset Columns**: Quick-add commonly used column types
- **Advanced Data Generation**: Custom sequences, foreign keys, localized data
- **Schema Validation**: Built-in validation with custom error messages

### 📥📤 Import/Export
- **Multiple Formats**: Import from CSV, JSON, XML, YAML, SQL files
- **Auto-detection**: Intelligent data type detection during import
- **Export Options**: Generate data in JSON, CSV, XML, YAML, SQL formats
- **Schema Download**: Export your column definitions as reusable schemas

### 🌐 API Integration
- **Endpoint Testing**: Built-in API testing tool with multiple HTTP methods
- **Authentication Support**: Bearer tokens, API keys, and custom headers
- **Request/Response Viewer**: Detailed API interaction logs
- **Batch Operations**: Send generated data to APIs in bulk

### 🎨 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Intuitive UI**: Material-UI components with modern design
- **Real-time Preview**: See generated data as you build your schema

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd test-data-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Define Your Data Schema

#### Adding Columns
1. Click the **"Add column"** button
2. Enter a descriptive column name
3. Select from 50+ data types or type a custom one
4. Configure constraints if needed

#### Using Templates
1. Click **"Templates"** button
2. Choose from pre-built templates like:
   - **User Management**: ID, Name, Email, Phone, Address
   - **E-commerce**: Product ID, Name, Price, Category, Description
   - **Financial**: Account ID, Balance, Transaction Type, Date

#### Using Presets
1. Click **"Presets"** button
2. Add commonly used columns instantly (Email, Phone, Address, etc.)

### 2. Configure Constraints

For each column, you can set:
- **Required**: Make the field mandatory
- **Length Limits**: Min/max character length
- **Numeric Ranges**: Min/max values for numbers
- **Custom Patterns**: Regex validation patterns
- **Custom Messages**: Personalized error messages

### 3. Advanced Data Generation

Access advanced options via the **"Advanced"** button:
- **Custom Sequences**: Auto-incrementing IDs with custom prefixes
- **Foreign Keys**: Reference relationships between tables
- **Localized Data**: Generate data in specific languages
- **Custom Formats**: Define your own data generation patterns

### 4. Import Existing Data

1. Click **"Import File"** button
2. Drag & drop or browse for your file
3. Supported formats: CSV, JSON, XML, YAML, SQL
4. The system automatically detects data types and creates columns

### 5. Generate and Export Data

1. **View Data**: Click **"View Current State"** to see generated samples
2. **Configure Records**: Set the number of records to generate
3. **Export**: Choose your preferred format:
   - **JSON**: For API integration
   - **CSV**: For spreadsheet applications
   - **XML**: For legacy systems
   - **YAML**: For configuration files
   - **SQL**: For database seeding

### 6. API Testing

1. Click the **"Test Endpoint"** button in the header
2. Configure your API request:
   - **Method**: GET, POST, PUT, DELETE, PATCH
   - **URL**: Your API endpoint
   - **Headers**: Authentication and custom headers
   - **Body**: JSON payload for POST/PUT requests
3. Send test requests and view detailed responses

## 🎯 Data Types Supported

### Personal Information
- First Name, Last Name, Full Name
- Job Title, Company Name
- Username, Password

### Contact Information
- Email Address
- Phone Number
- Address, City, State, Country, ZIP Code

### Technical Data
- UUID v4
- Auto-increment ID
- Custom Sequences
- Foreign Keys

### Business Data
- Price, Cost, Amount
- Rating, Score
- Percentage

### Date & Time
- Date, DateTime
- Timestamp
- Custom Date Formats

### Custom Types
- Custom Format Strings
- Regex-based Generation
- Localized Content

## 🛠️ Advanced Configuration

### Custom Data Generation
```javascript
// Example custom format
"custom format": "USER-{auto-increment:4}"
// Generates: USER-0001, USER-0002, etc.
```

### Constraint Examples
```json
{
  "name": "Email",
  "type": "Email",
  "constraints": {
    "required": true,
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "customValidation": "Please enter a valid email address"
  }
}
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check TypeScript types
npm run type-check

# Lint code
npm run lint
```

### Project Structure
```
src/
├── components/
│   ├── ColumnsTable.tsx      # Main column management
│   ├── ExportSection.tsx     # Data generation & export
│   ├── AdvancedDataGen.tsx   # Advanced generation options
│   └── EndpointTest.tsx      # API testing component
├── types/
│   └── index.ts              # TypeScript definitions
├── utils/
│   └── helpers.ts            # Utility functions
└── App.tsx                   # Main application
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Data Generation**: Faker.js v8
- **State Management**: React Hooks
- **Build Tool**: Create React App
- **Styling**: Material-UI Theme System

### Key Components
- **ColumnsTable**: Tree-like column definition interface
- **ExportSection**: Data generation and export functionality
- **AdvancedDataGen**: Advanced data generation options
- **EndpointTest**: API testing and integration

## 📊 Performance

- **Fast Generation**: Generate 10,000+ records in seconds
- **Memory Efficient**: Optimized for large datasets
- **Responsive UI**: Smooth experience even with complex schemas
- **Type Safe**: Full TypeScript coverage for reliability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Faker.js](https://fakerjs.dev/) for realistic data generation
- [Material-UI](https://mui.com/) for beautiful UI components
- [React](https://reactjs.org/) for the robust frontend framework

## 📞 Support

If you have any questions or need help:
- 📧 Email: support@testdataengine.com
- 💬 GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- 📖 Documentation: [Full Documentation](https://docs.testdataengine.com)

---

**Made with ❤️ for developers who need quality test data**
