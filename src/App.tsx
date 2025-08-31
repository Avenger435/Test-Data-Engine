import React, { useState, useEffect, createContext, useContext } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import './App.css';
import ColumnsTable from './ColumnsTable';
import ExportSection from './ExportSection';

// Create light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

// Theme context
const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleTheme: () => void;
}>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const initialColumns = [
  { name: 'ID', type: 'ID', constraints: {} },
  { name: 'Name', type: 'FirstName LastName', constraints: {} },
  { name: 'Email', type: 'Email Address', constraints: {} },
];

function AppContent() {
  const [columns, setColumns] = useState<{ name: string; type: string; constraints?: any; }[]>(initialColumns);
  const { isDarkMode, toggleTheme } = useTheme();

  // Endpoint testing state
  const [endpointTestOpen, setEndpointTestOpen] = useState(false);
  const [testType, setTestType] = useState<'api' | 'webhook'>('api');
  const [testUrl, setTestUrl] = useState('');
  const [testMethod, setTestMethod] = useState('GET');
  const [testHeaders, setTestHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [testBody, setTestBody] = useState('');
  const [testAuthType, setTestAuthType] = useState<'none' | 'bearer' | 'apiKey'>('none');
  const [testAuthToken, setTestAuthToken] = useState('');
  const [testApiKey, setTestApiKey] = useState('');
  const [testApiKeyHeader, setTestApiKeyHeader] = useState('X-API-Key');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    statusText: string;
    response: any;
    responseTime: number;
    headers: Record<string, string>;
    success: boolean;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tableDefinition');
    if (saved) {
      setColumns(JSON.parse(saved));
    }
  }, []);

  const addTestHeader = () => {
    setTestHeaders([...testHeaders, { key: '', value: '' }]);
  };

  const updateTestHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...testHeaders];
    newHeaders[index][field] = value;
    setTestHeaders(newHeaders);
  };

  const removeTestHeader = (index: number) => {
    if (testHeaders.length > 1) {
      setTestHeaders(testHeaders.filter((_, i) => i !== index));
    }
  };

  const testEndpoint = async () => {
    if (!testUrl.trim()) {
      alert('Please enter a URL to test.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const startTime = Date.now();
    const headers: Record<string, string> = {};

    // Add custom headers
    testHeaders.forEach(header => {
      if (header.key.trim() && header.value.trim()) {
        headers[header.key] = header.value;
      }
    });

    // Add authentication
    if (testAuthType === 'bearer' && testAuthToken) {
      headers['Authorization'] = `Bearer ${testAuthToken}`;
    } else if (testAuthType === 'apiKey' && testApiKey) {
      headers[testApiKeyHeader] = testApiKey;
    }

    const requestOptions: RequestInit = {
      method: testMethod,
      headers,
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(testMethod) && testBody.trim()) {
      requestOptions.body = testBody;
    }

    try {
      const response = await fetch(testUrl, requestOptions);
      const responseTime = Date.now() - startTime;

      let responseData;
      const responseHeaders: Record<string, string> = {};

      // Get response headers
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        response: responseData,
        responseTime,
        headers: responseHeaders,
        success: response.ok
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setTestResult({
        status: 0,
        statusText: 'Network Error',
        response: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        headers: {},
        success: false
      });
    } finally {
      setIsTesting(false);
    }
  };

  const resetTest = () => {
    setTestResult(null);
    setTestUrl('');
    setTestMethod('GET');
    setTestHeaders([{ key: 'Content-Type', value: 'application/json' }]);
    setTestBody('');
    setTestAuthType('none');
    setTestAuthToken('');
    setTestApiKey('');
    setTestApiKeyHeader('X-API-Key');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' } }}
            >
              Test Data Engine
            </Typography>
            <Button
              color="inherit"
              onClick={() => setEndpointTestOpen(true)}
              sx={{ mr: 1, textTransform: 'none' }}
            >
              Endpoint Tester
            </Button>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label="toggle theme"
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ColumnsTable columns={columns} setColumns={setColumns} />
        </Box>
        <Box>
          <ExportSection columns={columns} />
        </Box>
      </Container>

      {/* Endpoint Testing Dialog */}
      <Dialog
        open={endpointTestOpen}
        onClose={() => setEndpointTestOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">API/Webhook Endpoint Testing</Typography>
          <Typography variant="body2" color="text.secondary">
            Test your API and webhook endpoints before using them in your data generation workflow
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Test Type Selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Test Type</InputLabel>
              <Select
                value={testType}
                label="Test Type"
                onChange={(e) => setTestType(e.target.value as 'api' | 'webhook')}
              >
                <MenuItem value="api">API Endpoint</MenuItem>
                <MenuItem value="webhook">Webhook Endpoint</MenuItem>
              </Select>
            </FormControl>

            {/* URL and Method */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={testMethod}
                  label="Method"
                  onChange={(e) => setTestMethod(e.target.value)}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="URL"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </Box>

            {/* Authentication */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Authentication</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Auth Type</InputLabel>
                <Select
                  value={testAuthType}
                  label="Auth Type"
                  onChange={(e) => setTestAuthType(e.target.value as 'none' | 'bearer' | 'apiKey')}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="apiKey">API Key</MenuItem>
                </Select>
              </FormControl>

              {testAuthType === 'bearer' && (
                <TextField
                  fullWidth
                  label="Bearer Token"
                  type="password"
                  value={testAuthToken}
                  onChange={(e) => setTestAuthToken(e.target.value)}
                  placeholder="Enter your bearer token"
                />
              )}

              {testAuthType === 'apiKey' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Header Name"
                    value={testApiKeyHeader}
                    onChange={(e) => setTestApiKeyHeader(e.target.value)}
                    placeholder="X-API-Key"
                    sx={{ width: 150 }}
                  />
                  <TextField
                    fullWidth
                    label="API Key"
                    type="password"
                    value={testApiKey}
                    onChange={(e) => setTestApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                </Box>
              )}
            </Box>

            {/* Headers */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Headers</Typography>
              {testHeaders.map((header, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    label="Header Name"
                    value={header.key}
                    onChange={(e) => updateTestHeader(index, 'key', e.target.value)}
                    placeholder="Content-Type"
                    sx={{ width: 200 }}
                  />
                  <TextField
                    label="Header Value"
                    fullWidth
                    value={header.value}
                    onChange={(e) => updateTestHeader(index, 'value', e.target.value)}
                    placeholder="application/json"
                  />
                  <IconButton
                    onClick={() => removeTestHeader(index)}
                    disabled={testHeaders.length === 1}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={addTestHeader}
                startIcon={<MenuIcon />}
                size="small"
              >
                Add Header
              </Button>
            </Box>

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(testMethod) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Request Body</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </Box>
            )}

            {/* Test Result */}
            {testResult && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Test Result</Typography>
                <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {testResult.status} {testResult.statusText}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Response Time:</strong> {testResult.responseTime}ms
                  </Typography>
                </Alert>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Response Headers:</strong>
                </Typography>
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {Object.entries(testResult.headers).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Response Body:</strong>
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875rem', maxHeight: 200, overflow: 'auto' }}>
                  {typeof testResult.response === 'string'
                    ? testResult.response
                    : JSON.stringify(testResult.response, null, 2)
                  }
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetTest}>
            Reset
          </Button>
          <Button onClick={() => setEndpointTestOpen(false)}>
            Close
          </Button>
          <Button
            onClick={testEndpoint}
            variant="contained"
            disabled={isTesting || !testUrl.trim()}
            startIcon={isTesting ? <CircularProgress size={20} /> : null}
          >
            {isTesting ? 'Testing...' : 'Test Endpoint'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => {
      const newTheme = !prev;
      localStorage.setItem('theme', JSON.stringify(newTheme));
      return newTheme;
    });
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
