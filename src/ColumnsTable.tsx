import React from 'react';
import {
  IconButton, Button, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Autocomplete,
  Card, CardContent, CardActions, Chip, Alert, Snackbar, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import TemplateIcon from '@mui/icons-material/Description';
import PresetIcon from '@mui/icons-material/Bookmark';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CodeIcon from '@mui/icons-material/Code';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AdvancedDataGen from './AdvancedDataGen';

interface ValidationConstraints {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidation?: string;
}

interface Column {
  name: string;
  type: string;
  constraints?: ValidationConstraints;
}

interface ColumnsTableProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

// Template interface
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  columns: Column[];
  icon?: string;
}

// Preset interface for individual column configurations
interface Preset {
  id: string;
  name: string;
  type: string;
  constraints?: ValidationConstraints;
  description: string;
}

// Comprehensive list of supported Faker.js data types
const FAKER_TYPES = [
  'ID',
  'First Name',
  'Last Name',
  'FirstName LastName',
  'Email Address',
  'Phone',
  'Job Title',
  'Address',
  'City',
  'Country',
  'Date',
  'Age',
  'Number',
  'Boolean',
  'Status',
  'Active',
  'Verified',
  'Price',
  'Cost',
  'Amount',
  'Salary',
  'Rating',
  'Score',
  'Percentage',
  'Nullable',
  'Optional',
  // Advanced Data Generation Types
  'auto-increment id',
  'uuid v4',
  'timestamp',
  'custom sequence',
  'custom format',
  'foreign key',
  'parent reference',
  'localized name',
  'localized address',
  'localized phone'
];

// Predefined templates for common use cases
const TEMPLATES: Template[] = [
  {
    id: 'user-profile',
    name: 'User Profile',
    description: 'Complete user information including personal details, contact info, and account status',
    category: 'User Management',
    columns: [
      { name: 'User ID', type: 'ID', constraints: { required: true } },
      { name: 'Full Name', type: 'FirstName LastName', constraints: { required: true, minLength: 2 } },
      { name: 'Email', type: 'Email Address', constraints: { required: true } },
      { name: 'Phone', type: 'Phone', constraints: {} },
      { name: 'Age', type: 'Age', constraints: { min: 13, max: 120 } },
      { name: 'Job Title', type: 'Job Title', constraints: {} },
      { name: 'Active', type: 'Boolean', constraints: {} },
      { name: 'Created Date', type: 'Date', constraints: {} }
    ]
  },
  {
    id: 'ecommerce-product',
    name: 'E-commerce Product',
    description: 'Product catalog with pricing, inventory, and category information',
    category: 'E-commerce',
    columns: [
      { name: 'Product ID', type: 'ID', constraints: { required: true } },
      { name: 'Product Name', type: 'First Name', constraints: { required: true, minLength: 3 } },
      { name: 'Description', type: 'Last Name', constraints: { maxLength: 500 } },
      { name: 'Price', type: 'Price', constraints: { min: 0.01, required: true } },
      { name: 'Category', type: 'Job Title', constraints: {} },
      { name: 'Stock Quantity', type: 'Number', constraints: { min: 0 } },
      { name: 'In Stock', type: 'Boolean', constraints: {} },
      { name: 'Rating', type: 'Rating', constraints: { min: 0, max: 5 } }
    ]
  },
  {
    id: 'address-book',
    name: 'Address Book',
    description: 'Contact information with addresses and personal details',
    category: 'Contacts',
    columns: [
      { name: 'Contact ID', type: 'ID', constraints: { required: true } },
      { name: 'First Name', type: 'First Name', constraints: { required: true } },
      { name: 'Last Name', type: 'Last Name', constraints: { required: true } },
      { name: 'Email', type: 'Email Address', constraints: {} },
      { name: 'Phone', type: 'Phone', constraints: {} },
      { name: 'Address', type: 'Address', constraints: {} },
      { name: 'City', type: 'City', constraints: {} },
      { name: 'Country', type: 'Country', constraints: {} }
    ]
  },
  {
    id: 'financial-transaction',
    name: 'Financial Transaction',
    description: 'Transaction records with amounts, dates, and status tracking',
    category: 'Finance',
    columns: [
      { name: 'Transaction ID', type: 'ID', constraints: { required: true } },
      { name: 'Amount', type: 'Amount', constraints: { required: true, min: 0.01 } },
      { name: 'Transaction Date', type: 'Date', constraints: { required: true } },
      { name: 'Description', type: 'Last Name', constraints: { maxLength: 200 } },
      { name: 'Status', type: 'Status', constraints: {} },
      { name: 'Account ID', type: 'ID', constraints: {} },
      { name: 'Processed', type: 'Boolean', constraints: {} }
    ]
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Content management for blog posts and articles',
    category: 'Content',
    columns: [
      { name: 'Post ID', type: 'ID', constraints: { required: true } },
      { name: 'Title', type: 'First Name', constraints: { required: true, minLength: 5, maxLength: 100 } },
      { name: 'Content', type: 'Last Name', constraints: { minLength: 50 } },
      { name: 'Author', type: 'FirstName LastName', constraints: { required: true } },
      { name: 'Publish Date', type: 'Date', constraints: {} },
      { name: 'Published', type: 'Boolean', constraints: {} },
      { name: 'Views', type: 'Number', constraints: { min: 0 } },
      { name: 'Rating', type: 'Rating', constraints: { min: 0, max: 5 } }
    ]
  },
  {
    id: 'employee-record',
    name: 'Employee Record',
    description: 'HR employee information with salary and department details',
    category: 'HR',
    columns: [
      { name: 'Employee ID', type: 'ID', constraints: { required: true } },
      { name: 'Full Name', type: 'FirstName LastName', constraints: { required: true } },
      { name: 'Email', type: 'Email Address', constraints: { required: true } },
      { name: 'Phone', type: 'Phone', constraints: {} },
      { name: 'Job Title', type: 'Job Title', constraints: { required: true } },
      { name: 'Department', type: 'Job Title', constraints: {} },
      { name: 'Salary', type: 'Salary', constraints: { min: 0 } },
      { name: 'Start Date', type: 'Date', constraints: {} },
      { name: 'Active', type: 'Boolean', constraints: {} }
    ]
  }
];

// Column presets for quick addition
const COLUMN_PRESETS: Preset[] = [
  { id: 'email-required', name: 'Required Email', type: 'Email Address', constraints: { required: true }, description: 'Email field that must be filled' },
  { id: 'phone-optional', name: 'Optional Phone', type: 'Phone', constraints: {}, description: 'Phone number field (optional)' },
  { id: 'age-adult', name: 'Adult Age', type: 'Age', constraints: { min: 18, max: 100 }, description: 'Age between 18-100 years' },
  { id: 'price-positive', name: 'Positive Price', type: 'Price', constraints: { min: 0.01, required: true }, description: 'Price that must be greater than 0' },
  { id: 'rating-1-5', name: '1-5 Star Rating', type: 'Rating', constraints: { min: 1, max: 5 }, description: 'Rating from 1 to 5 stars' },
  { id: 'boolean-status', name: 'Status Flag', type: 'Boolean', constraints: {}, description: 'True/false status indicator' },
  { id: 'name-full', name: 'Full Name', type: 'FirstName LastName', constraints: { required: true, minLength: 2 }, description: 'Complete first and last name' },
  { id: 'id-uuid', name: 'UUID ID', type: 'ID', constraints: { required: true }, description: 'Unique identifier using UUID format' },
  { id: 'date-recent', name: 'Recent Date', type: 'Date', constraints: {}, description: 'Date from recent past to present' },
  { id: 'percentage-0-100', name: 'Percentage', type: 'Percentage', constraints: { min: 0, max: 100 }, description: 'Value between 0-100%' }
];

const initialColumns = [
  { name: 'ID', type: 'ID', constraints: {} },
  { name: 'Name', type: 'FirstName LastName', constraints: {} },
  { name: 'Email', type: 'Email Address', constraints: {} },
  { name: 'Phone', type: 'Phone', constraints: {} },
  { name: 'Age', type: 'Age', constraints: {} },
  { name: 'Salary', type: 'Price', constraints: {} },
  { name: 'Active', type: 'Boolean', constraints: {} },
  { name: 'Rating', type: 'Rating', constraints: {} },
];

export default function ColumnsTable({ columns, setColumns }: ColumnsTableProps) {
  const [constraintDialog, setConstraintDialog] = React.useState<{
    open: boolean;
    columnIndex: number;
    constraints: ValidationConstraints;
  }>({
    open: false,
    columnIndex: -1,
    constraints: {}
  });

  const [columnDialog, setColumnDialog] = React.useState<{
    open: boolean;
    isEdit: boolean;
    columnIndex: number;
    name: string;
    type: string;
  }>({
    open: false,
    isEdit: false,
    columnIndex: -1,
    name: '',
    type: ''
  });

  const [templatesDialog, setTemplatesDialog] = React.useState<{
    open: boolean;
    mode: 'templates' | 'presets';
  }>({
    open: false,
    mode: 'templates'
  });

  const [importDialog, setImportDialog] = React.useState<{
    open: boolean;
    dragOver: boolean;
  }>({
    open: false,
    dragOver: false
  });

  const [advancedDialog, setAdvancedDialog] = React.useState<{
    open: boolean;
  }>({
    open: false
  });

  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [expandedSections, setExpandedSections] = React.useState<string[]>([
    'personal', 'contact', 'business', 'location', 'technical', 'other'
  ]);

  const categorizeColumn = (column: Column): string => {
    const name = column.name.toLowerCase();
    const type = column.type.toLowerCase();

    // Personal Information
    if (name.includes('name') || name.includes('first') || name.includes('last') ||
        name.includes('full') || name.includes('title') || type.includes('name')) {
      return 'personal';
    }

    // Contact Information
    if (name.includes('email') || name.includes('phone') || name.includes('mobile') ||
        name.includes('contact') || type.includes('email') || type.includes('phone')) {
      return 'contact';
    }

    // Business Information
    if (name.includes('company') || name.includes('organization') || name.includes('department') ||
        name.includes('job') || name.includes('position') || name.includes('salary') ||
        name.includes('price') || name.includes('cost') || name.includes('amount') ||
        type.includes('company') || type.includes('price')) {
      return 'business';
    }

    // Location Information
    if (name.includes('address') || name.includes('city') || name.includes('state') ||
        name.includes('country') || name.includes('zip') || name.includes('postal') ||
        name.includes('location') || type.includes('address') || type.includes('city') ||
        type.includes('country')) {
      return 'location';
    }

    // Technical/IDs
    if (name.includes('id') || name.includes('key') || name.includes('uuid') ||
        name.includes('auto') || type.includes('id') || type.includes('uuid') ||
        type.includes('auto-increment')) {
      return 'technical';
    }

    // Default to other
    return 'other';
  };

  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      personal: { label: 'Personal Information', icon: PersonIcon, color: '#1976d2' },
      contact: { label: 'Contact Information', icon: ContactMailIcon, color: '#388e3c' },
      business: { label: 'Business Information', icon: BusinessIcon, color: '#f57c00' },
      location: { label: 'Location Information', icon: LocationOnIcon, color: '#7b1fa2' },
      technical: { label: 'Technical/IDs', icon: CodeIcon, color: '#d32f2f' },
      other: { label: 'Other Fields', icon: MoreHorizIcon, color: '#616161' }
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.other;
  };

  const handleAccordionChange = (category: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev =>
      isExpanded
        ? [...prev, category]
        : prev.filter(section => section !== category)
    );
  };

  const addColumn = () => {
    setColumnDialog({
      open: true,
      isEdit: false,
      columnIndex: -1,
      name: '',
      type: ''
    });
  };

  const editColumn = (index: number) => {
    setColumnDialog({
      open: true,
      isEdit: true,
      columnIndex: index,
      name: columns[index].name,
      type: columns[index].type
    });
  };

  const deleteColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
  };

  const resetColumns = () => {
    setColumns(initialColumns.map(col => ({ ...col, constraints: {} })));
  };

  const saveTableDefinition = () => {
    // Create JSON schema with all validations
    const schema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Test Data Engine Schema",
      description: "Generated schema for test data generation with validations",
      type: "object",
      properties: {} as any,
      required: [] as string[]
    };

    // Add each column to the schema
    columns.forEach((column, index) => {
      const property: any = {
        title: column.name,
        description: `Column ${index + 1}: ${column.name} (${column.type})`
      };

      // Map data types to JSON schema types
      switch (column.type.toLowerCase()) {
        case 'id':
        case 'auto-increment id':
        case 'uuid v4':
          property.type = 'string';
          if (column.type.toLowerCase() === 'uuid v4') {
            property.format = 'uuid';
          }
          break;
        case 'first name':
        case 'last name':
        case 'firstname lastname':
        case 'job title':
        case 'address':
        case 'city':
        case 'country':
        case 'firstnamelastname':
        case 'custom sequence':
        case 'custom format':
        case 'localized name':
        case 'localized address':
          property.type = 'string';
          break;
        case 'email address':
          property.type = 'string';
          property.format = 'email';
          break;
        case 'phone':
        case 'localized phone':
          property.type = 'string';
          break;
        case 'date':
          property.type = 'string';
          property.format = 'date';
          break;
        case 'timestamp':
          property.type = 'string';
          property.format = 'date-time';
          break;
        case 'age':
        case 'number':
          property.type = 'integer';
          break;
        case 'price':
        case 'cost':
        case 'amount':
        case 'salary':
        case 'rating':
        case 'score':
        case 'percentage':
          property.type = 'number';
          break;
        case 'boolean':
        case 'status':
        case 'active':
        case 'verified':
          property.type = 'boolean';
          break;
        case 'foreign key':
        case 'parent reference':
          property.type = 'string';
          break;
        default:
          property.type = 'string';
      }

      // Add validation constraints
      if (column.constraints) {
        if (column.constraints.required) {
          schema.required.push(column.name);
        }

        if (column.constraints.minLength !== undefined) {
          property.minLength = column.constraints.minLength;
        }

        if (column.constraints.maxLength !== undefined) {
          property.maxLength = column.constraints.maxLength;
        }

        if (column.constraints.min !== undefined) {
          if (property.type === 'integer' || property.type === 'number') {
            property.minimum = column.constraints.min;
          }
        }

        if (column.constraints.max !== undefined) {
          if (property.type === 'integer' || property.type === 'number') {
            property.maximum = column.constraints.max;
          }
        }

        if (column.constraints.pattern) {
          property.pattern = column.constraints.pattern;
        }

        if (column.constraints.customValidation) {
          property.description += ` (Custom validation: ${column.constraints.customValidation})`;
        }
      }

      schema.properties[column.name] = property;
    });

    // Convert to JSON string with pretty formatting
    const schemaJson = JSON.stringify(schema, null, 2);

    // Create downloadable file
    const blob = new Blob([schemaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table-schema.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);

    // Also save to localStorage for backward compatibility
    localStorage.setItem('tableDefinition', JSON.stringify(columns));

    showNotification('Schema downloaded successfully as table-schema.json!', 'success');
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ open: false, message: '', severity: 'info' });
  };

  const parseCSV = (csvText: string): Column[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const sampleData = lines.slice(1, Math.min(6, lines.length)); // Sample first 5 rows for type detection

    return headers.map((header, index) => {
      // Try to detect data type from sample data
      const sampleValues = sampleData
        .map(line => {
          const values = line.split(',');
          return values[index]?.trim().replace(/"/g, '') || '';
        })
        .filter(val => val !== '');

      let detectedType = 'First Name'; // Default fallback

      if (sampleValues.length > 0) {
        const firstValue = sampleValues[0];

        // Email detection
        if (firstValue.includes('@') && firstValue.includes('.')) {
          detectedType = 'Email Address';
        }
        // Phone detection
        else if (/^\+?[\d\s\-().]+$/.test(firstValue) && firstValue.replace(/[^\d]/g, '').length >= 10) {
          detectedType = 'Phone';
        }
        // Number detection
        else if (!isNaN(Number(firstValue)) && firstValue.trim() !== '') {
          const num = Number(firstValue);
          if (Number.isInteger(num)) {
            detectedType = 'Number';
          } else {
            detectedType = 'Price';
          }
        }
        // Boolean detection
        else if (['true', 'false', 'yes', 'no', '1', '0'].includes(firstValue.toLowerCase())) {
          detectedType = 'Boolean';
        }
        // Date detection
        else if (!isNaN(Date.parse(firstValue))) {
          detectedType = 'Date';
        }
        // ID detection
        else if (header.toLowerCase().includes('id') || header.toLowerCase().includes('key')) {
          detectedType = 'ID';
        }
        // Name detection
        else if (header.toLowerCase().includes('name') || header.toLowerCase().includes('title')) {
          detectedType = 'First Name';
        }
        // Address detection
        else if (header.toLowerCase().includes('address') || header.toLowerCase().includes('street')) {
          detectedType = 'Address';
        }
        // City detection
        else if (header.toLowerCase().includes('city')) {
          detectedType = 'City';
        }
        // Country detection
        else if (header.toLowerCase().includes('country')) {
          detectedType = 'Country';
        }
      }

      return {
        name: header,
        type: detectedType,
        constraints: {}
      };
    });
  };

  const parseJSON = (jsonText: string): Column[] => {
    try {
      const data = JSON.parse(jsonText);
      const columns: Column[] = [];

      // Handle array of objects
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        Object.keys(firstItem).forEach(key => {
          const value = firstItem[key];
          let detectedType = 'First Name';

          // Type detection based on value
          if (typeof value === 'string') {
            if (value.includes('@') && value.includes('.')) {
              detectedType = 'Email Address';
            } else if (/^\+?[\d\s\-().]+$/.test(value) && value.replace(/[^\d]/g, '').length >= 10) {
              detectedType = 'Phone';
            } else if (key.toLowerCase().includes('id') || key.toLowerCase().includes('key')) {
              detectedType = 'ID';
            } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
              detectedType = 'First Name';
            } else if (key.toLowerCase().includes('address') || key.toLowerCase().includes('street')) {
              detectedType = 'Address';
            } else if (key.toLowerCase().includes('city')) {
              detectedType = 'City';
            } else if (key.toLowerCase().includes('country')) {
              detectedType = 'Country';
            }
          } else if (typeof value === 'number') {
            detectedType = Number.isInteger(value) ? 'Number' : 'Price';
          } else if (typeof value === 'boolean') {
            detectedType = 'Boolean';
          } else if (value instanceof Date || !isNaN(Date.parse(String(value)))) {
            detectedType = 'Date';
          }

          columns.push({
            name: key,
            type: detectedType,
            constraints: {}
          });
        });
      }
      // Handle single object
      else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(key => {
          const value = data[key];
          let detectedType = 'First Name';

          // Type detection based on value
          if (typeof value === 'string') {
            if (value.includes('@') && value.includes('.')) {
              detectedType = 'Email Address';
            } else if (/^\+?[\d\s\-().]+$/.test(value) && value.replace(/[^\d]/g, '').length >= 10) {
              detectedType = 'Phone';
            } else if (key.toLowerCase().includes('id') || key.toLowerCase().includes('key')) {
              detectedType = 'ID';
            } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
              detectedType = 'First Name';
            } else if (key.toLowerCase().includes('address') || key.toLowerCase().includes('street')) {
              detectedType = 'Address';
            } else if (key.toLowerCase().includes('city')) {
              detectedType = 'City';
            } else if (key.toLowerCase().includes('country')) {
              detectedType = 'Country';
            }
          } else if (typeof value === 'number') {
            detectedType = Number.isInteger(value) ? 'Number' : 'Price';
          } else if (typeof value === 'boolean') {
            detectedType = 'Boolean';
          } else if (value instanceof Date || !isNaN(Date.parse(String(value)))) {
            detectedType = 'Date';
          }

          columns.push({
            name: key,
            type: detectedType,
            constraints: {}
          });
        });
      }

      return columns;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  const parseTSV = (tsvText: string): Column[] => {
    const lines = tsvText.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split('\t').map((header: string) => header.trim().replace(/"/g, ''));
    const sampleData = lines.slice(1, Math.min(6, lines.length)); // Sample first 5 rows for type detection

    return headers.map((header: string, index: number) => {
      // Try to detect data type from sample data
      const sampleValues = sampleData
        .map((line: string) => {
          const values = line.split('\t');
          return values[index]?.trim().replace(/"/g, '') || '';
        })
        .filter((val: string) => val !== '');

      let detectedType = 'First Name'; // Default fallback

      if (sampleValues.length > 0) {
        const firstValue = sampleValues[0];

        // Email detection
        if (firstValue.includes('@') && firstValue.includes('.')) {
          detectedType = 'Email Address';
        }
        // Phone detection
        else if (/^\+?[\d\s\-().]+$/.test(firstValue) && firstValue.replace(/[^\d]/g, '').length >= 10) {
          detectedType = 'Phone';
        }
        // Number detection
        else if (!isNaN(Number(firstValue)) && firstValue.trim() !== '') {
          const num = Number(firstValue);
          if (Number.isInteger(num)) {
            detectedType = 'Number';
          } else {
            detectedType = 'Price';
          }
        }
        // Boolean detection
        else if (['true', 'false', 'yes', 'no', '1', '0'].includes(firstValue.toLowerCase())) {
          detectedType = 'Boolean';
        }
        // Date detection
        else if (!isNaN(Date.parse(firstValue))) {
          detectedType = 'Date';
        }
        // ID detection
        else if (header.toLowerCase().includes('id') || header.toLowerCase().includes('key')) {
          detectedType = 'ID';
        }
        // Name detection
        else if (header.toLowerCase().includes('name') || header.toLowerCase().includes('title')) {
          detectedType = 'First Name';
        }
        // Address detection
        else if (header.toLowerCase().includes('address') || header.toLowerCase().includes('street')) {
          detectedType = 'Address';
        }
        // City detection
        else if (header.toLowerCase().includes('city')) {
          detectedType = 'City';
        }
        // Country detection
        else if (header.toLowerCase().includes('country')) {
          detectedType = 'Country';
        }
      }

      return {
        name: header,
        type: detectedType,
        constraints: {}
      };
    });
  };

  const parseXML = (xmlText: string): Column[] => {
    try {
      // Simple XML parsing - extract tag names and sample values
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Check for parse errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid XML format');
      }

      const columns: Column[] = [];
      const rootElement = xmlDoc.documentElement;

      // If it's a list of items, get the first item to determine schema
      const firstChild = rootElement.firstElementChild;
      if (firstChild && firstChild.children.length > 0) {
        // Multiple records
        Array.from(firstChild.children).forEach(child => {
          const tagName = child.tagName;
          const value = child.textContent?.trim() || '';

          let detectedType = 'First Name';
          if (value.includes('@')) {
            detectedType = 'Email Address';
          } else if (/^\+?[\d\s\-().]+$/.test(value) && value.replace(/[^\d]/g, '').length >= 10) {
            detectedType = 'Phone';
          } else if (!isNaN(Number(value)) && value.trim() !== '') {
            detectedType = Number.isInteger(Number(value)) ? 'Number' : 'Price';
          } else if (['true', 'false'].includes(value.toLowerCase())) {
            detectedType = 'Boolean';
          } else if (tagName.toLowerCase().includes('id')) {
            detectedType = 'ID';
          } else if (tagName.toLowerCase().includes('name')) {
            detectedType = 'First Name';
          }

          columns.push({
            name: tagName,
            type: detectedType,
            constraints: {}
          });
        });
      } else {
        // Single record - get all child elements
        Array.from(rootElement.children).forEach(child => {
          const tagName = child.tagName;
          const value = child.textContent?.trim() || '';

          let detectedType = 'First Name';
          if (value.includes('@')) {
            detectedType = 'Email Address';
          } else if (/^\+?[\d\s\-().]+$/.test(value) && value.replace(/[^\d]/g, '').length >= 10) {
            detectedType = 'Phone';
          } else if (!isNaN(Number(value)) && value.trim() !== '') {
            detectedType = Number.isInteger(Number(value)) ? 'Number' : 'Price';
          } else if (['true', 'false'].includes(value.toLowerCase())) {
            detectedType = 'Boolean';
          }

          columns.push({
            name: tagName,
            type: detectedType,
            constraints: {}
          });
        });
      }

      return columns;
    } catch (error) {
      throw new Error('Invalid XML format');
    }
  };

  const parseYAML = (yamlText: string): Column[] => {
    try {
      // Simple YAML parsing - this is a basic implementation
      // In a real app, you'd want to use a proper YAML parser library
      const lines = yamlText.trim().split('\n');
      const columns: Column[] = [];

      for (const line of lines) {
        if (line.includes(':') && !line.startsWith(' ') && !line.startsWith('-')) {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            let detectedType = 'First Name';

            // Remove quotes if present
            const cleanValue = value.replace(/^["']|["']$/g, '');

            if (cleanValue.includes('@')) {
              detectedType = 'Email Address';
            } else if (/^\+?[\d\s\-().]+$/.test(cleanValue) && cleanValue.replace(/[^\d]/g, '').length >= 10) {
              detectedType = 'Phone';
            } else if (!isNaN(Number(cleanValue)) && cleanValue.trim() !== '') {
              detectedType = Number.isInteger(Number(cleanValue)) ? 'Number' : 'Price';
            } else if (['true', 'false'].includes(cleanValue.toLowerCase())) {
              detectedType = 'Boolean';
            } else if (key.toLowerCase().includes('id')) {
              detectedType = 'ID';
            } else if (key.toLowerCase().includes('name')) {
              detectedType = 'First Name';
            }

            columns.push({
              name: key,
              type: detectedType,
              constraints: {}
            });
          }
        }
      }

      return columns;
    } catch (error) {
      throw new Error('Invalid YAML format');
    }
  };

  const parseJSONSchema = (schemaText: string): Column[] => {
    try {
      const schema = JSON.parse(schemaText);

      // Check if it's a valid JSON schema
      if (!schema.properties || typeof schema.properties !== 'object') {
        throw new Error('Invalid JSON schema: missing properties object');
      }

      const columns: Column[] = [];
      const requiredFields = schema.required || [];

      // Process each property in the schema
      Object.entries(schema.properties).forEach(([propertyName, propertyDef]: [string, any]) => {
        const column: Column = {
          name: propertyName,
          type: 'First Name', // Default fallback
          constraints: {}
        };

        // Map JSON schema types to Faker types
        if (propertyDef.type) {
          switch (propertyDef.type) {
            case 'string':
              if (propertyDef.format === 'email') {
                column.type = 'Email Address';
              } else if (propertyDef.format === 'uuid') {
                column.type = 'uuid v4';
              } else if (propertyDef.format === 'date') {
                column.type = 'Date';
              } else if (propertyDef.format === 'date-time') {
                column.type = 'timestamp';
              } else if (propertyName.toLowerCase().includes('phone')) {
                column.type = 'Phone';
              } else if (propertyName.toLowerCase().includes('address')) {
                column.type = 'Address';
              } else if (propertyName.toLowerCase().includes('city')) {
                column.type = 'City';
              } else if (propertyName.toLowerCase().includes('country')) {
                column.type = 'Country';
              } else if (propertyName.toLowerCase().includes('name')) {
                column.type = 'First Name';
              } else if (propertyName.toLowerCase().includes('id') || propertyName.toLowerCase().includes('key')) {
                column.type = 'ID';
              } else {
                column.type = 'First Name'; // Default string type
              }
              break;

            case 'integer':
              if (propertyName.toLowerCase().includes('age')) {
                column.type = 'Age';
              } else {
                column.type = 'Number';
              }
              break;

            case 'number':
              if (propertyName.toLowerCase().includes('price') ||
                  propertyName.toLowerCase().includes('cost') ||
                  propertyName.toLowerCase().includes('amount') ||
                  propertyName.toLowerCase().includes('salary')) {
                column.type = 'Price';
              } else if (propertyName.toLowerCase().includes('rating') ||
                        propertyName.toLowerCase().includes('score')) {
                column.type = 'Rating';
              } else if (propertyName.toLowerCase().includes('percentage')) {
                column.type = 'Percentage';
              } else {
                column.type = 'Price'; // Default numeric type
              }
              break;

            case 'boolean':
              column.type = 'Boolean';
              break;

            default:
              column.type = 'First Name'; // Fallback
          }
        }

        // Add constraints from JSON schema
        const constraints: ValidationConstraints = {};

        // Required constraint
        if (requiredFields.includes(propertyName)) {
          constraints.required = true;
        }

        // String constraints
        if (propertyDef.minLength !== undefined) {
          constraints.minLength = propertyDef.minLength;
        }
        if (propertyDef.maxLength !== undefined) {
          constraints.maxLength = propertyDef.maxLength;
        }
        if (propertyDef.pattern) {
          constraints.pattern = propertyDef.pattern;
        }

        // Numeric constraints
        if (propertyDef.minimum !== undefined) {
          constraints.min = propertyDef.minimum;
        }
        if (propertyDef.maximum !== undefined) {
          constraints.max = propertyDef.maximum;
        }

        // Custom validation from description
        if (propertyDef.description && propertyDef.description.includes('Custom validation:')) {
          const customValidationMatch = propertyDef.description.match(/Custom validation:\s*(.+)/);
          if (customValidationMatch) {
            constraints.customValidation = customValidationMatch[1];
          }
        }

        column.constraints = constraints;
        columns.push(column);
      });

      return columns;
    } catch (error) {
      throw new Error(`Invalid JSON schema format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const parseSQL = (sqlText: string): Column[] => {
    try {
      // Basic SQL CREATE TABLE parsing
      const createTableMatch = sqlText.match(/CREATE\s+TABLE\s+\w+\s*\(([\s\S]*?)\)/i);
      if (!createTableMatch) {
        throw new Error('No CREATE TABLE statement found');
      }

      const columnsText = createTableMatch[1];
      const columnDefinitions = columnsText.split(',').map(col => col.trim());

      const columns: Column[] = [];

      for (const colDef of columnDefinitions) {
        const parts = colDef.split(/\s+/);
        if (parts.length >= 2) {
          const columnName = parts[0].replace(/["`]/g, '');
          const sqlType = parts[1].toUpperCase();

          let detectedType = 'First Name';

          // Map SQL types to Faker types
          if (sqlType.includes('INT') || sqlType.includes('NUMBER')) {
            detectedType = 'Number';
          } else if (sqlType.includes('VARCHAR') || sqlType.includes('TEXT') || sqlType.includes('CHAR')) {
            if (columnName.toLowerCase().includes('email')) {
              detectedType = 'Email Address';
            } else if (columnName.toLowerCase().includes('phone')) {
              detectedType = 'Phone';
            } else if (columnName.toLowerCase().includes('name')) {
              detectedType = 'First Name';
            } else if (columnName.toLowerCase().includes('address')) {
              detectedType = 'Address';
            } else if (columnName.toLowerCase().includes('city')) {
              detectedType = 'City';
            } else if (columnName.toLowerCase().includes('country')) {
              detectedType = 'Country';
            } else {
              detectedType = 'First Name';
            }
          } else if (sqlType.includes('BOOLEAN') || sqlType.includes('BIT')) {
            detectedType = 'Boolean';
          } else if (sqlType.includes('DATE') || sqlType.includes('TIME')) {
            detectedType = 'Date';
          } else if (sqlType.includes('DECIMAL') || sqlType.includes('FLOAT') || sqlType.includes('DOUBLE')) {
            detectedType = 'Price';
          }

          // Check if it's a primary key
          const isPrimaryKey = colDef.toUpperCase().includes('PRIMARY KEY') ||
                              columnName.toLowerCase().includes('id');

          columns.push({
            name: columnName,
            type: isPrimaryKey ? 'ID' : detectedType,
            constraints: isPrimaryKey ? { required: true } : {}
          });
        }
      }

      return columns;
    } catch (error) {
      throw new Error('Invalid SQL format or no CREATE TABLE found');
    }
  };

  const handleFileImport = async (file: File) => {
    try {
      const text = await file.text();
      let importedColumns: Column[] = [];

      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.csv')) {
        importedColumns = parseCSV(text);
        showNotification(`Successfully imported ${importedColumns.length} columns from CSV`, 'success');
      } else if (fileName.endsWith('.json')) {
        // Check if it's a JSON schema file
        try {
          const jsonData = JSON.parse(text);
          if (jsonData.$schema && jsonData.properties && typeof jsonData.properties === 'object') {
            // It's a JSON schema file
            importedColumns = parseJSONSchema(text);
            showNotification(`Successfully imported ${importedColumns.length} columns from JSON Schema`, 'success');
          } else {
            // It's regular JSON data
            importedColumns = parseJSON(text);
            showNotification(`Successfully imported ${importedColumns.length} columns from JSON`, 'success');
          }
        } catch (error) {
          // If JSON parsing fails, try regular JSON parsing
          importedColumns = parseJSON(text);
          showNotification(`Successfully imported ${importedColumns.length} columns from JSON`, 'success');
        }
      } else if (fileName.endsWith('.tsv') || fileName.endsWith('.txt')) {
        importedColumns = parseTSV(text);
        showNotification(`Successfully imported ${importedColumns.length} columns from TSV`, 'success');
      } else if (fileName.endsWith('.xml')) {
        importedColumns = parseXML(text);
        showNotification(`Successfully imported ${importedColumns.length} columns from XML`, 'success');
      } else if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        importedColumns = parseYAML(text);
        showNotification(`Successfully imported ${importedColumns.length} columns from YAML`, 'success');
      } else if (fileName.endsWith('.sql')) {
        importedColumns = parseSQL(text);
        showNotification(`Successfully imported ${importedColumns.length} columns from SQL`, 'success');
      } else {
        showNotification('Unsupported file format. Please use CSV, JSON, JSON Schema, TSV, XML, YAML, or SQL files.', 'error');
        return;
      }

      if (importedColumns.length > 0) {
        setColumns(importedColumns);
        setImportDialog({ open: false, dragOver: false });
      } else {
        showNotification('No columns found in the file.', 'error');
      }
    } catch (error) {
      showNotification(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    // Reset the input
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setImportDialog(prev => ({ ...prev, dragOver: true }));
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setImportDialog(prev => ({ ...prev, dragOver: false }));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setImportDialog(prev => ({ ...prev, dragOver: false }));

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileImport(files[0]);
    }
  };

  const openImportDialog = () => {
    setImportDialog({ open: true, dragOver: false });
  };

  const closeImportDialog = () => {
    setImportDialog({ open: false, dragOver: false });
  };

  const openAdvancedDialog = () => {
    setAdvancedDialog({ open: true });
  };

  const closeAdvancedDialog = () => {
    setAdvancedDialog({ open: false });
  };

  const openConstraintDialog = (index: number) => {
    setConstraintDialog({
      open: true,
      columnIndex: index,
      constraints: columns[index].constraints || {}
    });
  };

  const closeConstraintDialog = () => {
    setConstraintDialog({ open: false, columnIndex: -1, constraints: {} });
  };

  const closeColumnDialog = () => {
    setColumnDialog({
      open: false,
      isEdit: false,
      columnIndex: -1,
      name: '',
      type: ''
    });
  };

  const saveColumn = () => {
    if (!columnDialog.name.trim() || !columnDialog.type.trim()) {
      alert('Please enter both column name and type.');
      return;
    }

    if (columnDialog.isEdit) {
      const updatedColumns = [...columns];
      updatedColumns[columnDialog.columnIndex] = {
        ...updatedColumns[columnDialog.columnIndex],
        name: columnDialog.name.trim(),
        type: columnDialog.type.trim()
      };
      setColumns(updatedColumns);
    } else {
      setColumns([...columns, {
        name: columnDialog.name.trim(),
        type: columnDialog.type.trim(),
        constraints: {}
      }]);
    }
    closeColumnDialog();
  };

  const openTemplatesDialog = (mode: 'templates' | 'presets') => {
    setTemplatesDialog({ open: true, mode });
  };

  const closeTemplatesDialog = () => {
    setTemplatesDialog({ open: false, mode: 'templates' });
  };

  const applyTemplate = (template: Template) => {
    const confirmMessage = `This will replace all current columns with the "${template.name}" template. Continue?`;
    if (window.confirm(confirmMessage)) {
      setColumns(template.columns.map(col => ({ ...col, constraints: { ...col.constraints } })));
      closeTemplatesDialog();
    }
  };

  const applyPreset = (preset: Preset) => {
    setColumns([...columns, {
      name: preset.name,
      type: preset.type,
      constraints: { ...preset.constraints }
    }]);
    closeTemplatesDialog();
  };

  const saveConstraints = () => {
    const updatedColumns = [...columns];
    updatedColumns[constraintDialog.columnIndex].constraints = constraintDialog.constraints;
    setColumns(updatedColumns);
    closeConstraintDialog();
  };

  const updateConstraint = (key: keyof ValidationConstraints, value: any) => {
    setConstraintDialog(prev => ({
      ...prev,
      constraints: { ...prev.constraints, [key]: value }
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        1. Define the parameters
      </Typography>

      {/* Tree-like Accordion Structure */}
      <Box sx={{ mb: 2 }}>
        {['personal', 'contact', 'business', 'location', 'technical', 'other'].map((category) => {
          const categoryInfo = getCategoryInfo(category);
          const categoryColumns = columns.filter(col => categorizeColumn(col) === category);
          const IconComponent = categoryInfo.icon;

          if (categoryColumns.length === 0) return null;

          return (
            <Accordion
              key={category}
              expanded={expandedSections.includes(category)}
              onChange={handleAccordionChange(category)}
              sx={{
                mb: 1,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconComponent sx={{ color: categoryInfo.color }} />
                  <Typography variant="h6" sx={{ color: categoryInfo.color }}>
                    {categoryInfo.label}
                  </Typography>
                  <Chip
                    label={`${categoryColumns.length} column${categoryColumns.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ py: 0 }}>
                  {categoryColumns.map((col, idx) => {
                    const actualIndex = columns.findIndex(c => c === col);
                    return (
                      <React.Fragment key={actualIndex}>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">{col.name}</Typography>
                                <Chip
                                  label={col.type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              col.constraints && Object.keys(col.constraints).length > 0 ? (
                                <Typography variant="caption" color="primary">
                                  {Object.keys(col.constraints).length} constraint(s)
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="textSecondary">
                                  No constraints
                                </Typography>
                              )
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton size="small" color="secondary" onClick={() => openConstraintDialog(actualIndex)} title="Set constraints">
                              <SettingsIcon />
                            </IconButton>
                            <IconButton size="small" color="primary" onClick={() => editColumn(actualIndex)} title="Edit column">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteColumn(actualIndex)} title="Delete column">
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {idx < categoryColumns.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Show message when no columns */}
      {columns.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body1">No columns defined yet.</Typography>
          <Typography variant="body2">Click "Add column" to get started.</Typography>
        </Box>
      )}

      <Box mt={2}>
        <Button variant="outlined" onClick={addColumn}>Add column</Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={openImportDialog}
          startIcon={<UploadFileIcon />}
        >
          Import File
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={() => openTemplatesDialog('templates')}
          startIcon={<TemplateIcon />}
        >
          Templates
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={() => openTemplatesDialog('presets')}
          startIcon={<PresetIcon />}
        >
          Presets
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ ml: 2 }}
          onClick={openAdvancedDialog}
          startIcon={<SettingsIcon />}
        >
          Advanced
        </Button>
        <Button variant="outlined" sx={{ ml: 2 }} onClick={resetColumns}>Reset columns</Button>
        <Button variant="contained" sx={{ ml: 2 }} onClick={saveTableDefinition}>Download Schema</Button>
      </Box>

      {/* Constraint Dialog */}
      <Dialog open={constraintDialog.open} onClose={closeConstraintDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Set Constraints for "{constraintDialog.columnIndex >= 0 ? columns[constraintDialog.columnIndex]?.name : ''}"
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={constraintDialog.constraints.required || false}
                  onChange={(e) => updateConstraint('required', e.target.checked)}
                />
              }
              label="Required field"
            />

            {/* String constraints */}
            {(columns[constraintDialog.columnIndex]?.type?.toLowerCase().includes('name') ||
              columns[constraintDialog.columnIndex]?.type?.toLowerCase().includes('title') ||
              columns[constraintDialog.columnIndex]?.type?.toLowerCase().includes('address')) && (
              <>
                <TextField
                  label="Minimum Length"
                  type="number"
                  value={constraintDialog.constraints.minLength || ''}
                  onChange={(e) => updateConstraint('minLength', e.target.value ? parseInt(e.target.value) : undefined)}
                  size="small"
                />
                <TextField
                  label="Maximum Length"
                  type="number"
                  value={constraintDialog.constraints.maxLength || ''}
                  onChange={(e) => updateConstraint('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                  size="small"
                />
              </>
            )}

            {/* Number constraints */}
            {columns[constraintDialog.columnIndex]?.type?.toLowerCase().includes('number') && (
              <>
                <TextField
                  label="Minimum Value"
                  type="number"
                  value={constraintDialog.constraints.min || ''}
                  onChange={(e) => updateConstraint('min', e.target.value ? parseInt(e.target.value) : undefined)}
                  size="small"
                />
                <TextField
                  label="Maximum Value"
                  type="number"
                  value={constraintDialog.constraints.max || ''}
                  onChange={(e) => updateConstraint('max', e.target.value ? parseInt(e.target.value) : undefined)}
                  size="small"
                />
              </>
            )}

            {/* Pattern constraint */}
            <TextField
              label="Pattern (Regex)"
              value={constraintDialog.constraints.pattern || ''}
              onChange={(e) => updateConstraint('pattern', e.target.value || undefined)}
              size="small"
              placeholder="e.g., ^[A-Z][a-z]+$"
              helperText="Optional regex pattern for validation"
            />

            {/* Custom validation */}
            <TextField
              label="Custom Validation Message"
              value={constraintDialog.constraints.customValidation || ''}
              onChange={(e) => updateConstraint('customValidation', e.target.value || undefined)}
              size="small"
              multiline
              rows={2}
              placeholder="Custom validation message (optional)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConstraintDialog}>Cancel</Button>
          <Button onClick={saveConstraints} variant="contained">Save Constraints</Button>
        </DialogActions>
      </Dialog>

      {/* Column Dialog */}
      <Dialog open={columnDialog.open} onClose={closeColumnDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {columnDialog.isEdit ? 'Edit Column' : 'Add New Column'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Column Name"
              value={columnDialog.name}
              onChange={(e) => setColumnDialog(prev => ({ ...prev, name: e.target.value }))}
              size="small"
              placeholder="e.g., User ID, Full Name, Email"
              fullWidth
              autoFocus
            />

            <Autocomplete
              options={FAKER_TYPES}
              value={columnDialog.type}
              onChange={(_, newValue) => setColumnDialog(prev => ({ ...prev, type: newValue || '' }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Data Type"
                  size="small"
                  placeholder="Select or type a data type..."
                  helperText="Choose from supported Faker.js data types"
                />
              )}
              freeSolo
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeColumnDialog}>Cancel</Button>
          <Button onClick={saveColumn} variant="contained">
            {columnDialog.isEdit ? 'Update Column' : 'Add Column'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Templates and Presets Dialog */}
      <Dialog
        open={templatesDialog.open}
        onClose={closeTemplatesDialog}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          {templatesDialog.mode === 'templates' ? 'Choose a Template' : 'Choose a Preset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {templatesDialog.mode === 'templates'
                ? 'Templates provide complete column sets for common use cases. Applying a template will replace all current columns.'
                : 'Presets are individual column configurations that can be quickly added to your existing table.'
              }
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {templatesDialog.mode === 'templates' ? (
                TEMPLATES.map((template) => (
                  <Box key={template.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' }, mb: 2 }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        <Chip
                          label={template.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {template.columns.length} columns
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {template.columns.slice(0, 3).map((col, idx) => (
                            <Chip
                              key={idx}
                              label={`${col.name} (${col.type})`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                          {template.columns.length > 3 && (
                            <Chip
                              label={`+${template.columns.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => applyTemplate(template)}
                          fullWidth
                        >
                          Apply Template
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                ))
              ) : (
                COLUMN_PRESETS.map((preset) => (
                  <Box key={preset.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%' }, mb: 2 }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {preset.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {preset.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={preset.type}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          {preset.constraints && Object.keys(preset.constraints).length > 0 && (
                            <Typography variant="caption" color="primary">
                              {Object.keys(preset.constraints).length} constraint(s)
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => applyPreset(preset)}
                          fullWidth
                        >
                          Add Preset
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTemplatesDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog.open} onClose={closeImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Import File
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Import CSV, JSON, TSV, XML, YAML, or SQL files to automatically create column schemas. The system will detect data types and create appropriate columns.
            </Typography>

            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${importDialog.dragOver ? 'primary.main' : 'divider'}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: importDialog.dragOver ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                mb: 2
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'textSecondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {importDialog.dragOver ? 'Drop your file here' : 'Drag & drop your file here'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                or click to browse
              </Typography>
              <input
                type="file"
                accept=".csv,.json,.tsv,.txt,.xml,.yaml,.yml,.sql"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="outlined" component="span">
                  Choose File
                </Button>
              </label>
            </Box>

            <Typography variant="caption" color="textSecondary">
              Supported formats: CSV, JSON, TSV, XML, YAML, SQL
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImportDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Advanced Data Generation Dialog */}
      <AdvancedDataGen
        columns={columns}
        setColumns={setColumns}
        open={advancedDialog.open}
        onClose={closeAdvancedDialog}
      />
    </Box>
  );
}