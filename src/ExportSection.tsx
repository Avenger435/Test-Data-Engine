import React, { useState, useCallback, useEffect } from 'react';
import {
  Button, TextField, Select, MenuItem, Box, Typography, LinearProgress,
  InputAdornment, IconButton, Table, TableBody, TableCell, TableHead,
  TableRow, TableContainer, Paper, TablePagination, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch,
  FormControl, InputLabel, Card, CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import GetAppIcon from '@mui/icons-material/GetApp';
import PublishIcon from '@mui/icons-material/Publish';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FirstPageIcon from '@mui/icons-material/FirstPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LastPageIcon from '@mui/icons-material/LastPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { faker } from '@faker-js/faker';
import { exportToFile, exportBatchToFiles } from './exportFile'; // Import the exportToFile function
import {
  generateUUID,
  generateTimestamp,
  generateAutoIncrementId,
  generateCustomSequence,
  generateCustomFormat,
  generateForeignKey,
  resetAllManagers
} from './advancedDataUtils';

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

interface ExportSectionProps {
  columns: Column[];
}

const ExportSection: React.FC<ExportSectionProps> = ({ columns }) => {
    const theme = useTheme();
    const [numRecords, setNumRecords] = useState(10);
    const [exportType, setExportType] = useState('JSON');

    // Enhanced Performance monitoring with better recommendations
    const getPerformanceWarning = (recordCount: number, columnCount: number): { level: 'info' | 'warning' | 'error', message: string } => {
        const estimatedSize = recordCount * columnCount * 50; // Rough estimate: 50 bytes per cell
        const sizeInMB = estimatedSize / (1024 * 1024);
        const estimatedTime = (recordCount * columnCount) / 10000; // Rough time estimate in seconds

        if (sizeInMB > 200 || recordCount > 100000) {
            return {
                level: 'error',
                message: `🚫 Dataset too large (${sizeInMB.toFixed(1)}MB, ${(estimatedTime/60).toFixed(1)}min). Maximum limit: 100K records or 200MB.`
            };
        } else if (sizeInMB > 100 || recordCount > 50000) {
            return {
                level: 'warning',
                message: `⚠️ Large dataset (${sizeInMB.toFixed(1)}MB, ~${estimatedTime.toFixed(0)}s generation). Consider reducing records for better performance.`
            };
        } else if (sizeInMB > 25 || recordCount > 10000) {
            return {
                level: 'warning',
                message: `⚠️ Medium dataset (${sizeInMB.toFixed(1)}MB, ~${estimatedTime.toFixed(0)}s generation). Monitor performance.`
            };
        } else if (recordCount > 10000) {
            return {
                level: 'info',
                message: `ℹ️ High record count (${recordCount.toLocaleString()}). Generation may take a few seconds.`
            };
        }
        return { level: 'info', message: '' };
    };

    // Update performance warning when parameters change
    useEffect(() => {
        const warning = getPerformanceWarning(numRecords, columns.length);
        setPerformanceWarning(warning);
    }, [numRecords, columns.length]);
    const [generatedData, setGeneratedData] = useState<any[]>([]);

    // Enhanced UX state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    // Performance monitoring
    const [performanceWarning, setPerformanceWarning] = useState<{ level: 'info' | 'warning' | 'error', message: string }>({ level: 'info', message: '' });

    // Batch Export state
    const [batchExportOpen, setBatchExportOpen] = useState(false);
    const [batchExports, setBatchExports] = useState<Array<{
        id: string;
        format: string;
        recordCount: number;
        filename: string;
        enabled: boolean;
    }>>([
        { id: '1', format: 'CSV', recordCount: numRecords, filename: 'data', enabled: true },
        { id: '2', format: 'JSON', recordCount: numRecords, filename: 'data', enabled: false },
        { id: '3', format: 'Excel', recordCount: numRecords, filename: 'data', enabled: false },
        { id: '4', format: 'SQL', recordCount: numRecords, filename: 'data', enabled: false },
        { id: '5', format: 'XML', recordCount: numRecords, filename: 'data', enabled: false }
    ]);
    const [batchProgress, setBatchProgress] = useState(0);
    const [isBatchExporting, setIsBatchExporting] = useState(false);

    // API Integration state
    const [apiDialogOpen, setApiDialogOpen] = useState(false);
    const [apiConfig, setApiConfig] = useState({
        url: '',
        method: 'POST',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        authType: 'none',
        authToken: '',
        apiKey: '',
        apiKeyHeader: 'X-API-Key',
        batchSize: 10,
        delayBetweenRequests: 100
    });
    const [apiProgress, setApiProgress] = useState(0);
    const [isSendingToApi, setIsSendingToApi] = useState(false);
    const [apiResults, setApiResults] = useState<Array<{
        recordIndex: number;
        status: number;
        success: boolean;
        response: any;
        error?: string;
        requestData: any;
        responseTime?: number;
        timestamp?: Date;
    }>>([]);

    // API Response Viewer state
    const [responseViewerOpen, setResponseViewerOpen] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<{
        recordIndex: number;
        status: number;
        success: boolean;
        response: any;
        error?: string;
        requestData: any;
        responseTime?: number;
        timestamp?: Date;
    } | null>(null);
    const [responseFilter, setResponseFilter] = useState<'all' | 'success' | 'error'>('all');
    const [responseSearch, setResponseSearch] = useState('');

    // API Templates state
    const [apiTemplates, setApiTemplates] = useState<Array<{
        id: string;
        name: string;
        description?: string;
        config: typeof apiConfig;
        createdAt: Date;
        lastUsed?: Date;
    }>>([]);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [templateManagementOpen, setTemplateManagementOpen] = useState(false);

    // Webhook Integration state
    const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
    const [webhookConfig, setWebhookConfig] = useState({
        url: '',
        method: 'POST',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        authType: 'none',
        authToken: '',
        apiKey: '',
        apiKeyHeader: 'X-API-Key',
        secret: '',
        signatureHeader: 'X-Webhook-Signature',
        batchSize: 10,
        delayBetweenRequests: 100,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000
    });
    const [webhookProgress, setWebhookProgress] = useState(0);
    const [isSendingToWebhook, setIsSendingToWebhook] = useState(false);
    const [webhookResults, setWebhookResults] = useState<Array<{
        recordIndex: number;
        status: number;
        success: boolean;
        response: any;
        error?: string;
        requestData: any;
        responseTime?: number;
        timestamp: Date;
        retryCount: number;
        webhookSignature?: string;
    }>>([]);

    // Webhook Templates state
    const [webhookTemplates, setWebhookTemplates] = useState<Array<{
        id: string;
        name: string;
        description?: string;
        config: typeof webhookConfig;
        createdAt: Date;
        lastUsed?: Date;
    }>>([]);
    const [webhookTemplateDialogOpen, setWebhookTemplateDialogOpen] = useState(false);
    const [webhookTemplateName, setWebhookTemplateName] = useState('');
    const [webhookTemplateDescription, setWebhookTemplateDescription] = useState('');
    const [selectedWebhookTemplate, setSelectedWebhookTemplate] = useState<string | null>(null);
    const [webhookTemplateManagementOpen, setWebhookTemplateManagementOpen] = useState(false);
    const [webhookResponseViewerOpen, setWebhookResponseViewerOpen] = useState(false);
    const [selectedWebhookResponse, setSelectedWebhookResponse] = useState<{
        recordIndex: number;
        status: number;
        success: boolean;
        response: any;
        error?: string;
        requestData: any;
        responseTime?: number;
        timestamp: Date;
        retryCount: number;
        webhookSignature?: string;
    } | null>(null);

    // Undo/Redo state
    const [dataHistory, setDataHistory] = useState<any[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Update filtered data when generated data changes
    useEffect(() => {
        setFilteredData(generatedData);
        setPage(0); // Reset to first page when data changes
    }, [generatedData]);

    // Update filtered data when search term changes
    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = generatedData.filter(record =>
                Object.values(record).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(generatedData);
        }
        setPage(0); // Reset to first page when search changes
    }, [searchTerm, generatedData]);

    const generateValue = useCallback((type: string, constraints?: ValidationConstraints): any => {
        let value: any;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops

        do {
            attempts++;
            switch (type.toLowerCase()) {
                case 'id':
                    value = faker.string.uuid();
                    break;
                case 'job title':
                    value = faker.person.jobTitle();
                    break;
                case 'email address':
                    value = faker.internet.email();
                    break;
                case 'firstname lastname':
                    value = faker.person.fullName();
                    break;
                case 'first name':
                    value = faker.person.firstName();
                    break;
                case 'last name':
                    value = faker.person.lastName();
                    break;
                case 'phone':
                    // Generate realistic US phone number format
                    const areaCodes = [
                        '201', '202', '203', '205', '206', '207', '208', '209', '210', '212', '213', '214', '215', '216', '217', '218', '219', '220', '224', '225', '228', '229', '231', '234', '239', '240', '248', '251', '252', '253', '254', '256', '260', '262', '267', '269', '270', '272', '276', '281', '301', '302', '303', '304', '305', '307', '308', '309', '310', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '323', '325', '330', '331', '334', '336', '337', '339', '346', '347', '351', '352', '360', '361', '364', '380', '385', '386', '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '415', '417', '419', '423', '424', '425', '430', '432', '434', '435', '440', '442', '443', '447', '458', '463', '464', '469', '470', '475', '478', '479', '480', '484', '501', '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517', '518', '520', '530', '531', '534', '539', '540', '541', '551', '559', '561', '562', '563', '564', '567', '570', '571', '573', '574', '575', '580', '585', '586', '601', '602', '603', '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619', '620', '623', '626', '628', '629', '630', '631', '636', '641', '646', '650', '651', '657', '660', '661', '662', '667', '669', '678', '681', '682', '701', '702', '703', '704', '706', '707', '708', '712', '713', '714', '715', '716', '717', '718', '719', '720', '724', '725', '727', '730', '731', '732', '734', '737', '740', '743', '747', '754', '757', '760', '762', '763', '765', '769', '770', '772', '773', '774', '775', '779', '781', '785', '786', '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815', '816', '817', '818', '828', '830', '831', '832', '843', '845', '847', '848', '850', '854', '856', '857', '858', '859', '860', '862', '863', '864', '865', '870', '872', '878', '901', '903', '904', '906', '907', '908', '909', '910', '912', '913', '914', '915', '916', '917', '918', '919', '920', '925', '928', '929', '930', '931', '934', '936', '937', '938', '940', '941', '947', '949', '951', '952', '954', '956', '959', '970', '971', '972', '973', '975', '978', '979', '980', '984', '985', '986', '989'
                    ];
                    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
                    const exchange = faker.string.numeric(3);
                    const number = faker.string.numeric(4);
                    const hasExtension = faker.datatype.boolean();
                    const extension = hasExtension ? ` x${faker.string.numeric({ length: { min: 3, max: 5 } })}` : '';
                    value = `(${areaCode}) ${exchange}-${number}${extension}`;
                    break;
                case 'address':
                    value = faker.location.streetAddress();
                    break;
                case 'city':
                    value = faker.location.city();
                    break;
                case 'country':
                    value = faker.location.country();
                    break;
                case 'date':
                    value = faker.date.recent().toISOString().split('T')[0];
                    break;
                case 'age':
                    const ageMin = constraints?.min ?? 1;
                    const ageMax = constraints?.max ?? 100;
                    value = faker.number.int({ min: ageMin, max: ageMax });
                    break;
                case 'number':
                    const min = constraints?.min ?? 1;
                    const max = constraints?.max ?? 100;
                    value = faker.number.int({ min, max });
                    break;
                case 'boolean':
                case 'status':
                case 'active':
                case 'verified':
                    value = faker.datatype.boolean();
                    break;
                case 'price':
                case 'cost':
                case 'amount':
                case 'salary':
                    value = faker.number.float({ min: 0, max: 10000, fractionDigits: 2 });
                    break;
                case 'rating':
                case 'score':
                    value = faker.number.float({ min: 0, max: 5, fractionDigits: 1 });
                    break;
                case 'percentage':
                    value = faker.number.float({ min: 0, max: 100, fractionDigits: 1 });
                    break;
                case 'nullable':
                case 'optional':
                    value = Math.random() > 0.3 ? faker.lorem.word() : null;
                    break;
                // Advanced Data Generation Types
                case 'auto-increment id':
                    value = generateAutoIncrementId(type, 1);
                    break;
                case 'uuid v4':
                    value = generateUUID();
                    break;
                case 'timestamp':
                    value = generateTimestamp();
                    break;
                case 'custom sequence':
                    value = generateCustomSequence(type);
                    break;
                case 'custom format':
                    try {
                        value = generateCustomFormat(type);
                    } catch (error) {
                        value = faker.string.alphanumeric(10); // Fallback
                    }
                    break;
                case 'foreign key':
                    try {
                        value = generateForeignKey(type);
                    } catch (error) {
                        value = faker.string.uuid(); // Fallback
                    }
                    break;
                case 'parent reference':
                    // This will be handled by relationship logic
                    value = faker.string.uuid();
                    break;
                case 'localized name':
                    // Use faker's localization if available
                    value = faker.person.fullName();
                    break;
                case 'localized address':
                    // Use faker's localization if available
                    value = faker.location.streetAddress();
                    break;
                case 'localized phone':
                    // Use faker's localization if available
                    value = faker.phone.number();
                    break;
            }

            // Apply string constraints
            if (typeof value === 'string') {
                if (constraints?.minLength && value.length < constraints.minLength) {
                    // Generate longer content
                    if (type.toLowerCase().includes('name')) {
                        value = faker.person.fullName();
                    } else if (type.toLowerCase().includes('address')) {
                        value = faker.location.streetAddress() + ', ' + faker.location.city();
                    } else {
                        value = faker.lorem.words(Math.ceil(constraints.minLength / 5));
                    }
                }
                
                if (constraints?.maxLength && value.length > constraints.maxLength) {
                    value = value.substring(0, constraints.maxLength);
                }
                
                if (constraints?.pattern && !new RegExp(constraints.pattern).test(value)) {
                    // For pattern mismatches, try generating a new value
                    continue;
                }
            }

        } while (attempts < maxAttempts && !validateValue(value, constraints));

        return value;
    }, []);

    const validateValue = (value: any, constraints?: ValidationConstraints): boolean => {
        if (!constraints) return true;

        // Required check
        if (constraints.required && (value === null || value === undefined || value === '')) {
            return false;
        }

        // String length checks
        if (typeof value === 'string') {
            if (constraints.minLength && value.length < constraints.minLength) return false;
            if (constraints.maxLength && value.length > constraints.maxLength) return false;
            if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) return false;
        }

        // Number range checks
        if (typeof value === 'number') {
            if (constraints.min !== undefined && value < constraints.min) return false;
            if (constraints.max !== undefined && value > constraints.max) return false;
        }

        return true;
    };

    const generateData = useCallback(async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        const data = [];
        const batchSize = Math.max(1, Math.floor(numRecords / 20)); // Update progress every 5%

        for (let i = 0; i < numRecords; i++) {
            const record: any = {};
            columns.forEach(col => {
                record[col.name] = generateValue(col.type, col.constraints);
            });
            data.push(record);

            // Update progress
            if ((i + 1) % batchSize === 0 || i === numRecords - 1) {
                const progress = Math.round(((i + 1) / numRecords) * 100);
                setGenerationProgress(progress);

                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        setIsGenerating(false);
        setGenerationProgress(100);

        // Show completion message briefly
        setTimeout(() => {
            setGenerationProgress(0);
        }, 1000);

        return data;
    }, [numRecords, columns, generateValue]);

    // Search and filter functionality - handled by useEffect
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
    };

    // Pagination handlers
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Undo/Redo functionality
    const saveToHistory = useCallback((data: any[]) => {
        const newHistory = dataHistory.slice(0, historyIndex + 1);
        newHistory.push([...data]);
        setDataHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [dataHistory, historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const previousData = dataHistory[historyIndex - 1];
            setGeneratedData(previousData);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < dataHistory.length - 1) {
            const nextData = dataHistory[historyIndex + 1];
            setGeneratedData(nextData);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleExport = async () => {
        resetAllManagers(); // Reset all advanced data managers before generating new data
        const dataToExport = await generateData();
        const finalDataToExport = searchTerm ? filteredData : dataToExport;
        exportToFile(finalDataToExport, 'generatedData.json', exportType); // Call exportToFile
    };

    const handleBatchExport = async () => {
        const enabledExports = batchExports.filter(exp => exp.enabled);
        if (enabledExports.length === 0) {
            alert('Please select at least one export format.');
            return;
        }

        setIsBatchExporting(true);
        setBatchProgress(0);
        setBatchExportOpen(false);

        resetAllManagers(); // Reset all advanced data managers

        try {
            // Generate all data once for maximum efficiency
            const allData = [];
            const maxRecords = Math.max(...enabledExports.map(exp => exp.recordCount));
            const batchSize = Math.max(1, Math.floor(maxRecords / 20));

            for (let i = 0; i < maxRecords; i++) {
                const record: any = {};
                columns.forEach(col => {
                    record[col.name] = generateValue(col.type, col.constraints);
                });
                allData.push(record);

                // Update progress for data generation
                if ((i + 1) % batchSize === 0 || i === maxRecords - 1) {
                    const progress = Math.round(((i + 1) / maxRecords) * 50); // First 50% for generation
                    setBatchProgress(progress);
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            // Use the batch export utility for the actual exports
            await exportBatchToFiles(
                allData,
                enabledExports.map(exp => ({
                    format: exp.format,
                    filename: exp.filename,
                    recordCount: exp.recordCount
                })),
                (progress) => {
                    // Second 50% for exports
                    setBatchProgress(50 + Math.round(progress / 2));
                }
            );

            setBatchProgress(100);
            setTimeout(() => {
                setBatchProgress(0);
                setIsBatchExporting(false);
            }, 2000);

        } catch (error) {
            console.error('Batch export failed:', error);
            alert('Batch export failed. Please try again.');
            setIsBatchExporting(false);
            setBatchProgress(0);
        }
    };

    const handleSendToApi = async () => {
        if (!apiConfig.url.trim()) {
            alert('Please enter a valid API URL.');
            return;
        }

        setIsSendingToApi(true);
        setApiProgress(0);
        setApiResults([]);
        setApiDialogOpen(false);

        resetAllManagers(); // Reset all advanced data managers

        try {
            // Generate data for API
            const data = [];
            const batchSize = Math.max(1, Math.floor(numRecords / 20));

            for (let i = 0; i < numRecords; i++) {
                const record: any = {};
                columns.forEach(col => {
                    record[col.name] = generateValue(col.type, col.constraints);
                });
                data.push(record);

                // Update progress for data generation
                if ((i + 1) % batchSize === 0 || i === numRecords - 1) {
                    const progress = Math.round(((i + 1) / numRecords) * 30); // First 30% for generation
                    setApiProgress(progress);
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            // Send data to API in batches
            const results: Array<{
                recordIndex: number;
                status: number;
                success: boolean;
                response: any;
                error?: string;
                requestData: any;
                responseTime?: number;
                timestamp?: Date;
            }> = [];

            const totalBatches = Math.ceil(data.length / apiConfig.batchSize);

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIndex = batchIndex * apiConfig.batchSize;
                const endIndex = Math.min(startIndex + apiConfig.batchSize, data.length);
                const batchData = data.slice(startIndex, endIndex);

                // Send batch to API
                for (let i = 0; i < batchData.length; i++) {
                    const recordIndex = startIndex + i;
                    try {
                        const response = await sendToApi(batchData[i], recordIndex);
                        results.push(response);

                        // Update progress
                        const overallProgress = 30 + Math.round(((batchIndex * apiConfig.batchSize + i + 1) / data.length) * 70);
                        setApiProgress(overallProgress);

                    } catch (error) {
                        results.push({
                            recordIndex,
                            status: 0,
                            success: false,
                            response: null,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            requestData: batchData[i],
                            responseTime: 0,
                            timestamp: new Date()
                        });
                    }

                    // Delay between requests
                    if (apiConfig.delayBetweenRequests > 0) {
                        await new Promise(resolve => setTimeout(resolve, apiConfig.delayBetweenRequests));
                    }
                }
            }

            setApiResults(results);
            setApiProgress(100);

            // Show summary
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            setTimeout(() => {
                setApiProgress(0);
                setIsSendingToApi(false);
                alert(`API calls completed!\n✅ Success: ${successCount}\n❌ Failed: ${failureCount}`);
            }, 2000);

        } catch (error) {
            console.error('API integration failed:', error);
            alert('API integration failed. Please check your configuration and try again.');
            setIsSendingToApi(false);
            setApiProgress(0);
        }
    };

    const sendToApi = async (record: any, recordIndex: number) => {
        const startTime = Date.now();
        const headers: Record<string, string> = {};

        // Add custom headers
        apiConfig.headers.forEach(header => {
            if (header.key.trim() && header.value.trim()) {
                headers[header.key] = header.value;
            }
        });

        // Add authentication
        if (apiConfig.authType === 'bearer' && apiConfig.authToken) {
            headers['Authorization'] = `Bearer ${apiConfig.authToken}`;
        } else if (apiConfig.authType === 'apiKey' && apiConfig.apiKey) {
            headers[apiConfig.apiKeyHeader] = apiConfig.apiKey;
        }

        const requestOptions: RequestInit = {
            method: apiConfig.method,
            headers,
        };

        // Add body for methods that support it
        if (['POST', 'PUT', 'PATCH'].includes(apiConfig.method)) {
            requestOptions.body = JSON.stringify(record);
        }

        const response = await fetch(apiConfig.url, requestOptions);
        const responseTime = Date.now() - startTime;

        let responseData;
        try {
            responseData = await response.json();
        } catch {
            responseData = await response.text();
        }

        return {
            recordIndex,
            status: response.status,
            success: response.ok,
            response: responseData,
            error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
            requestData: record,
            responseTime,
            timestamp: new Date()
        };
    };

    // API Template Functions
    const loadTemplatesFromStorage = () => {
        try {
            const stored = localStorage.getItem('apiTemplates');
            if (stored) {
                const parsed = JSON.parse(stored);
                setApiTemplates(parsed.map((template: any) => ({
                    ...template,
                    createdAt: new Date(template.createdAt),
                    lastUsed: template.lastUsed ? new Date(template.lastUsed) : undefined
                })));
            }
        } catch (error) {
            console.error('Failed to load API templates:', error);
        }
    };

    const saveTemplatesToStorage = (templates: typeof apiTemplates) => {
        try {
            localStorage.setItem('apiTemplates', JSON.stringify(templates));
        } catch (error) {
            console.error('Failed to save API templates:', error);
        }
    };

    const saveAsTemplate = () => {
        if (!templateName.trim()) {
            alert('Please enter a template name.');
            return;
        }

        const newTemplate = {
            id: Date.now().toString(),
            name: templateName.trim(),
            description: templateDescription.trim(),
            config: { ...apiConfig },
            createdAt: new Date()
        };

        const updatedTemplates = [...apiTemplates, newTemplate];
        setApiTemplates(updatedTemplates);
        saveTemplatesToStorage(updatedTemplates);

        setTemplateName('');
        setTemplateDescription('');
        setTemplateDialogOpen(false);
        alert('Template saved successfully!');
    };

    const loadTemplate = (templateId: string) => {
        const template = apiTemplates.find(t => t.id === templateId);
        if (template) {
            setApiConfig({ ...template.config });
            // Update last used
            const updatedTemplates = apiTemplates.map(t =>
                t.id === templateId
                    ? { ...t, lastUsed: new Date() }
                    : t
            );
            setApiTemplates(updatedTemplates);
            saveTemplatesToStorage(updatedTemplates);
            alert(`Template "${template.name}" loaded successfully!`);
        }
    };

    const deleteTemplate = (templateId: string) => {
        const template = apiTemplates.find(t => t.id === templateId);
        if (template && window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
            const updatedTemplates = apiTemplates.filter(t => t.id !== templateId);
            setApiTemplates(updatedTemplates);
            saveTemplatesToStorage(updatedTemplates);
        }
    };

    // Template Download/Import Functions
    const downloadTemplates = (templates: typeof apiTemplates, type: 'api' | 'webhook') => {
        const dataStr = JSON.stringify(templates, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const templateCount = templates.length;
        const templateName = templateCount === 1 ? templates[0].name.replace(/[^a-zA-Z0-9]/g, '_') : '';
        const exportFileDefaultName = templateCount === 1
            ? `${type}_template_${templateName}_${new Date().toISOString().split('T')[0]}.json`
            : `${type}_templates_${templateCount}_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const importTemplates = (event: React.ChangeEvent<HTMLInputElement>, type: 'api' | 'webhook') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTemplates = JSON.parse(e.target?.result as string);

                // Validate template structure
                if (!Array.isArray(importedTemplates)) {
                    throw new Error('Invalid template file format');
                }

                // Validate each template has required fields
                for (const template of importedTemplates) {
                    if (!template.id || !template.name || !template.config) {
                        throw new Error('Invalid template structure');
                    }
                }

                if (type === 'api') {
                    const mergedTemplates = [...apiTemplates];
                    importedTemplates.forEach((imported: any) => {
                        // Check if template with same name already exists
                        const existingIndex = mergedTemplates.findIndex(t => t.name === imported.name);
                        if (existingIndex >= 0) {
                            // Replace existing template
                            mergedTemplates[existingIndex] = {
                                ...imported,
                                id: mergedTemplates[existingIndex].id, // Keep original ID
                                createdAt: new Date(imported.createdAt),
                                lastUsed: imported.lastUsed ? new Date(imported.lastUsed) : undefined
                            };
                        } else {
                            // Add new template
                            mergedTemplates.push({
                                ...imported,
                                id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generate new ID
                                createdAt: new Date(imported.createdAt),
                                lastUsed: imported.lastUsed ? new Date(imported.lastUsed) : undefined
                            });
                        }
                    });
                    setApiTemplates(mergedTemplates);
                    saveTemplatesToStorage(mergedTemplates);
                } else {
                    const mergedTemplates = [...webhookTemplates];
                    importedTemplates.forEach((imported: any) => {
                        const existingIndex = mergedTemplates.findIndex(t => t.name === imported.name);
                        if (existingIndex >= 0) {
                            mergedTemplates[existingIndex] = {
                                ...imported,
                                id: mergedTemplates[existingIndex].id,
                                createdAt: new Date(imported.createdAt),
                                lastUsed: imported.lastUsed ? new Date(imported.lastUsed) : undefined
                            };
                        } else {
                            mergedTemplates.push({
                                ...imported,
                                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                createdAt: new Date(imported.createdAt),
                                lastUsed: imported.lastUsed ? new Date(imported.lastUsed) : undefined
                            });
                        }
                    });
                    setWebhookTemplates(mergedTemplates);
                    saveWebhookTemplatesToStorage(mergedTemplates);
                }

                alert(`${importedTemplates.length} ${type} template(s) imported successfully!`);
            } catch (error) {
                alert(`Failed to import templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    };

    // Load templates on component mount
    React.useEffect(() => {
        loadTemplatesFromStorage();
        loadWebhookTemplatesFromStorage();
    }, []);

    // Webhook Template Functions
    const loadWebhookTemplatesFromStorage = () => {
        try {
            const stored = localStorage.getItem('webhookTemplates');
            if (stored) {
                const parsed = JSON.parse(stored);
                setWebhookTemplates(parsed.map((template: any) => ({
                    ...template,
                    createdAt: new Date(template.createdAt),
                    lastUsed: template.lastUsed ? new Date(template.lastUsed) : undefined
                })));
            }
        } catch (error) {
            console.error('Failed to load webhook templates:', error);
        }
    };

    const saveWebhookTemplatesToStorage = (templates: typeof webhookTemplates) => {
        try {
            localStorage.setItem('webhookTemplates', JSON.stringify(templates));
        } catch (error) {
            console.error('Failed to save webhook templates:', error);
        }
    };

    const saveWebhookAsTemplate = () => {
        if (!webhookTemplateName.trim()) {
            alert('Please enter a template name.');
            return;
        }

        const newTemplate = {
            id: Date.now().toString(),
            name: webhookTemplateName.trim(),
            description: webhookTemplateDescription.trim(),
            config: { ...webhookConfig },
            createdAt: new Date()
        };

        const updatedTemplates = [...webhookTemplates, newTemplate];
        setWebhookTemplates(updatedTemplates);
        saveWebhookTemplatesToStorage(updatedTemplates);

        setWebhookTemplateName('');
        setWebhookTemplateDescription('');
        setWebhookTemplateDialogOpen(false);
        alert('Webhook template saved successfully!');
    };

    const loadWebhookTemplate = (templateId: string) => {
        const template = webhookTemplates.find(t => t.id === templateId);
        if (template) {
            setWebhookConfig({ ...template.config });
            // Update last used
            const updatedTemplates = webhookTemplates.map(t =>
                t.id === templateId
                    ? { ...t, lastUsed: new Date() }
                    : t
            );
            setWebhookTemplates(updatedTemplates);
            saveWebhookTemplatesToStorage(updatedTemplates);
            alert(`Webhook template "${template.name}" loaded successfully!`);
        }
    };

    const deleteWebhookTemplate = (templateId: string) => {
        const template = webhookTemplates.find(t => t.id === templateId);
        if (template && window.confirm(`Are you sure you want to delete the webhook template "${template.name}"?`)) {
            const updatedTemplates = webhookTemplates.filter(t => t.id !== templateId);
            setWebhookTemplates(updatedTemplates);
            saveWebhookTemplatesToStorage(updatedTemplates);
        }
    };

    // Webhook Functions
    const generateWebhookSignature = async (payload: string, secret: string): Promise<string> => {
        // Simple HMAC-SHA256 implementation for webhook signature
        const encoder = new TextEncoder();
        const key = encoder.encode(secret);
        const data = encoder.encode(payload);

        try {
            const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
            const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
            const hashArray = Array.from(new Uint8Array(signature));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.warn('Failed to generate webhook signature:', error);
            return '';
        }
    };

    const sendToWebhook = async (record: any, recordIndex: number, retryCount = 0): Promise<any> => {
        const startTime = Date.now();
        const headers: Record<string, string> = {};

        // Add custom headers
        webhookConfig.headers.forEach(header => {
            if (header.key.trim() && header.value.trim()) {
                headers[header.key] = header.value;
            }
        });

        // Add authentication
        if (webhookConfig.authType === 'bearer' && webhookConfig.authToken) {
            headers['Authorization'] = `Bearer ${webhookConfig.authToken}`;
        } else if (webhookConfig.authType === 'apiKey' && webhookConfig.apiKey) {
            headers[webhookConfig.apiKeyHeader] = webhookConfig.apiKey;
        }

        const payload = JSON.stringify(record);
        let webhookSignature = '';

        // Generate webhook signature if secret is provided
        if (webhookConfig.secret) {
            try {
                webhookSignature = await generateWebhookSignature(payload, webhookConfig.secret);
                headers[webhookConfig.signatureHeader] = `sha256=${webhookSignature}`;
            } catch (error) {
                console.warn('Failed to generate webhook signature:', error);
            }
        }

        const requestOptions: RequestInit = {
            method: webhookConfig.method,
            headers,
            body: payload,
            signal: AbortSignal.timeout(webhookConfig.timeout)
        };

        try {
            const response = await fetch(webhookConfig.url, requestOptions);
            const responseTime = Date.now() - startTime;

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = await response.text();
            }

            return {
                recordIndex,
                status: response.status,
                success: response.ok,
                response: responseData,
                error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
                requestData: record,
                responseTime,
                timestamp: new Date(),
                retryCount,
                webhookSignature
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            // Retry logic
            if (retryCount < webhookConfig.maxRetries) {
                console.log(`Webhook retry ${retryCount + 1}/${webhookConfig.maxRetries} for record ${recordIndex}`);
                await new Promise(resolve => setTimeout(resolve, webhookConfig.retryDelay * (retryCount + 1)));
                return sendToWebhook(record, recordIndex, retryCount + 1);
            }

            return {
                recordIndex,
                status: 0,
                success: false,
                response: null,
                error: error instanceof Error ? error.message : 'Network error',
                requestData: record,
                responseTime,
                timestamp: new Date(),
                retryCount,
                webhookSignature
            };
        }
    };

    const handleSendToWebhook = async () => {
        if (!webhookConfig.url.trim()) {
            alert('Please enter a webhook URL.');
            return;
        }

        resetAllManagers(); // Reset all advanced data managers
        const data = await generateData();

        if (data.length === 0) {
            alert('No data to send. Please generate some data first.');
            return;
        }

        setIsSendingToWebhook(true);
        setWebhookProgress(0);
        setWebhookResults([]);
        setWebhookDialogOpen(false);

        try {
            const results: Array<{
                recordIndex: number;
                status: number;
                success: boolean;
                response: any;
                error?: string;
                requestData: any;
                responseTime?: number;
                timestamp: Date;
                retryCount: number;
                webhookSignature?: string;
            }> = [];

            const totalBatches = Math.ceil(data.length / webhookConfig.batchSize);

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIndex = batchIndex * webhookConfig.batchSize;
                const endIndex = Math.min(startIndex + webhookConfig.batchSize, data.length);
                const batchData = data.slice(startIndex, endIndex);

                // Send batch to webhook
                for (let i = 0; i < batchData.length; i++) {
                    const recordIndex = startIndex + i;
                    try {
                        const response = await sendToWebhook(batchData[i], recordIndex);
                        results.push(response);

                        // Update progress
                        const overallProgress = Math.round(((batchIndex * webhookConfig.batchSize + i + 1) / data.length) * 100);
                        setWebhookProgress(overallProgress);

                    } catch (error) {
                        results.push({
                            recordIndex,
                            status: 0,
                            success: false,
                            response: null,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            requestData: batchData[i],
                            responseTime: 0,
                            timestamp: new Date(),
                            retryCount: 0
                        });
                    }
                }

                // Delay between batches
                if (batchIndex < totalBatches - 1 && webhookConfig.delayBetweenRequests > 0) {
                    await new Promise(resolve => setTimeout(resolve, webhookConfig.delayBetweenRequests));
                }
            }

            setWebhookResults(results);
            setWebhookProgress(100);

            // Show summary
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            setTimeout(() => {
                setIsSendingToWebhook(false);
                alert(`Webhook delivery completed!\n✅ Success: ${successCount}\n❌ Failed: ${failureCount}`);
            }, 2000);

        } catch (error) {
            console.error('Webhook integration failed:', error);
            alert('Webhook integration failed. Please check your configuration and try again.');
            setIsSendingToWebhook(false);
            setWebhookProgress(0);
        }
    };

    const handleViewCurrentState = async () => {
        resetAllManagers(); // Reset all advanced data managers before generating new data
        const data = await generateData();
        setGeneratedData(data);
        setFilteredData(data);
        saveToHistory(data);
    };

    const handleCopyToClipboard = () => {
        const dataToCopy = searchTerm ? filteredData : generatedData;
        let content = '';
        if (exportType === 'CSV') {
            content = convertToCSV(dataToCopy);
        } else if (exportType === 'SQL') {
            content = convertToSQL(dataToCopy);
        } else if (exportType === 'XML') {
            content = convertToXML(dataToCopy);
        } else if (exportType === 'Excel') {
            // For Excel, we'll show a message since it's binary format
            content = 'Excel files cannot be copied to clipboard. Please use the Export button.';
            alert(content);
            return;
        } else {
            content = JSON.stringify(dataToCopy, null, 2);
        }
        navigator.clipboard.writeText(content);
    };

    const convertToCSV = (data: any[]): string => {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        return `${headers}\n${rows}`;
    };

    const convertToSQL = (data: any[], tableName: string = 'generated_data'): string => {
        if (data.length === 0) return '';
        
        const columns = Object.keys(data[0]);
        const columnNames = columns.join(', ');
        
        const insertStatements = data.map(row => {
            const values = columns.map(col => {
                const value = row[col];
                if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
                }
                return value;
            }).join(', ');
            return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`;
        });
        
        return insertStatements.join('\n');
    };

    const convertToXML = (data: any[], rootName: string = 'data'): string => {
        if (data.length === 0) return `<${rootName}></${rootName}>`;
        
        const columns = Object.keys(data[0]);
        const xmlItems = data.map(row => {
            const itemElements = columns.map(col => {
                const value = row[col];
                const safeValue = typeof value === 'string' ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : value;
                return `    <${col}>${safeValue}</${col}>`;
            }).join('\n');
            return `  <item>\n${itemElements}\n  </item>`;
        }).join('\n');
        
        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${xmlItems}\n</${rootName}>`;
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                2. Generate & Export Data
            </Typography>

            {/* Progress Bar */}
            {(isGenerating || generationProgress > 0) && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                        {isGenerating
                            ? `Generating data... ${generationProgress}%`
                            : generationProgress === 100
                                ? 'Data generation completed!'
                                : ''
                        }
                    </Typography>
                    <LinearProgress
                        variant={isGenerating ? "determinate" : "determinate"}
                        value={generationProgress}
                        color={generationProgress === 100 ? "success" : "primary"}
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                </Box>
            )}

            {/* Main Controls Card */}
            <Card sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                    Data Generation Settings
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
                    <TextField
                        label="Number of Records"
                        type="number"
                        value={numRecords}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            // Set reasonable limits: 1 to 100,000 records
                            if (value >= 1 && value <= 100000) {
                                setNumRecords(value);
                            } else if (value > 100000) {
                                setNumRecords(100000); // Cap at 100K
                            } else if (value < 1) {
                                setNumRecords(1); // Minimum 1 record
                            }
                        }}
                        inputProps={{
                            min: 1,
                            max: 100000,
                            step: 100
                        }}
                        sx={{ minWidth: 150 }}
                    />
                    <Select
                        value={exportType}
                        onChange={(e) => setExportType(e.target.value)}
                        sx={{ minWidth: 100 }}
                    >
                        <MenuItem value="CSV">CSV</MenuItem>
                        <MenuItem value="JSON">JSON</MenuItem>
                        <MenuItem value="SQL">SQL INSERT</MenuItem>
                        <MenuItem value="Excel">Excel</MenuItem>
                        <MenuItem value="XML">XML</MenuItem>
                    </Select>

                    {/* Quick Record Count Presets */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ alignSelf: 'center', mr: 1 }}>Quick presets:</Typography>
                        {[100, 1000, 10000, 50000, 100000].map(count => (
                            <Button
                                key={count}
                                size="small"
                                variant={numRecords === count ? "contained" : "outlined"}
                                onClick={() => setNumRecords(count)}
                                sx={{ minWidth: 'auto', px: 1 }}
                            >
                                {count.toLocaleString()}
                            </Button>
                        ))}
                    </Box>

                    <Button
                        variant="contained"
                        onClick={handleExport}
                        disabled={isGenerating}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setBatchExportOpen(true)}
                        disabled={isGenerating}
                        color="secondary"
                    >
                        Batch Export
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setApiDialogOpen(true)}
                        disabled={isGenerating}
                        color="primary"
                    >
                        Send to API
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setTemplateManagementOpen(true)}
                        disabled={isGenerating}
                        color="info"
                    >
                        API Templates ({apiTemplates.length})
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setWebhookDialogOpen(true)}
                        disabled={isGenerating}
                        color="warning"
                    >
                        Send to Webhook
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setWebhookTemplateManagementOpen(true)}
                        disabled={isGenerating}
                        color="warning"
                    >
                        Webhook Templates ({webhookTemplates.length})
                    </Button>
                    {apiResults.length > 0 && (
                        <Button
                            variant="outlined"
                            onClick={() => setResponseViewerOpen(true)}
                            color="secondary"
                        >
                            View API Results ({apiResults.length})
                        </Button>
                    )}
                    {webhookResults.length > 0 && (
                        <Button
                            variant="outlined"
                            onClick={() => setWebhookResponseViewerOpen(true)}
                            color="warning"
                        >
                            View Webhook Results ({webhookResults.length})
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        onClick={handleViewCurrentState}
                        disabled={isGenerating}
                    >
                        View Current State
                    </Button>
                </Box>
            </Card>

            {/* Action Buttons */}
            {generatedData.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Button variant="text" onClick={handleCopyToClipboard}>
                        Copy to Clipboard
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleUndo}
                        disabled={dataHistory.length <= 1 || historyIndex <= 0}
                        size="small"
                    >
                        Undo
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRedo}
                        disabled={dataHistory.length <= 1 || historyIndex >= dataHistory.length - 1}
                        size="small"
                    >
                        Redo
                    </Button>
                </Box>
            )}

            {/* Performance Warning */}
            {performanceWarning.message && (
                <Alert severity={performanceWarning.level} sx={{ mb: 2 }}>
                    {performanceWarning.message}
                </Alert>
            )}

            {generatedData.length > 0 && (
                <Card sx={{ mt: 2, borderRadius: 2, boxShadow: 1 }}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                Generated Data Preview ({exportType})
                            </Typography>
                            <Chip
                                label={`${generatedData.length} records`}
                                size="small"
                                color="primary"
                                variant="filled"
                                sx={{ fontWeight: 500 }}
                            />
                        </Box>

                        {/* Search Bar */}
                        <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search in generated data..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleSearchChange('')}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Box>

                    {/* Data Display */}
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>
                                        #
                                    </TableCell>
                                    {columns.map((col, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}
                                        >
                                            {col.name}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(searchTerm ? filteredData : generatedData)
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((record, index) => (
                                        <TableRow key={page * rowsPerPage + index} hover>
                                            <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            {columns.map((col, colIndex) => (
                                                <TableCell key={colIndex}>
                                                    {typeof record[col.name] === 'boolean'
                                                        ? record[col.name] ? 'Yes' : 'No'
                                                        : String(record[col.name] || '')
                                                    }
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                {(searchTerm ? filteredData : generatedData).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchTerm ? 'No records match your search.' : 'No data available.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={searchTerm ? filteredData.length : generatedData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        sx={{ mt: 2 }}
                    />

                    {/* Search Results Info */}
                    {searchTerm && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Found {filteredData.length} records matching "{searchTerm}"
                        </Alert>
                    )}
                    </Box>
                </Card>
            )}

            {/* Batch Export Dialog */}
            <Dialog
                open={batchExportOpen}
                onClose={() => setBatchExportOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">Batch Export Configuration</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure multiple export formats and record counts
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {batchExports.map((exportConfig, index) => (
                            <Box key={exportConfig.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={exportConfig.enabled}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newExports = [...batchExports];
                                                    newExports[index].enabled = e.target.checked;
                                                    setBatchExports(newExports);
                                                }}
                                            />
                                        }
                                        label={`${exportConfig.format} Export`}
                                    />
                                </Box>

                                {exportConfig.enabled && (
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <TextField
                                            label="Records"
                                            type="number"
                                            size="small"
                                            value={exportConfig.recordCount}
                                            onChange={(e) => {
                                                const newExports = [...batchExports];
                                                const value = Number(e.target.value);
                                                newExports[index].recordCount = Math.min(Math.max(value, 1), 100000);
                                                setBatchExports(newExports);
                                            }}
                                            inputProps={{ min: 1, max: 100000 }}
                                            sx={{ width: 120 }}
                                        />
                                        <TextField
                                            label="Filename"
                                            size="small"
                                            value={exportConfig.filename}
                                            onChange={(e) => {
                                                const newExports = [...batchExports];
                                                newExports[index].filename = e.target.value;
                                                setBatchExports(newExports);
                                            }}
                                            sx={{ width: 150 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            .{exportConfig.format.toLowerCase()}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        ))}

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Batch Export Info:</strong><br />
                                • Each enabled format will generate separate files<br />
                                • Files will be named: filename_recordCount.format<br />
                                • Progress will be shown for the entire batch operation
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBatchExportOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBatchExport}
                        variant="contained"
                        disabled={batchExports.filter(exp => exp.enabled).length === 0}
                    >
                        Start Batch Export
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Batch Export Progress */}
            {isBatchExporting && (
                <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
                    <Alert severity="info">
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Batch Export in Progress...</strong>
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={batchProgress}
                            sx={{ mb: 1 }}
                        />
                        <Typography variant="caption">
                            {batchProgress}% complete
                        </Typography>
                    </Alert>
                </Box>
            )}

            {/* API Integration Dialog */}
            <Dialog
                open={apiDialogOpen}
                onClose={() => setApiDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">API Integration Configuration</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Send generated data directly to REST APIs
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* API URL */}
                        <TextField
                            label="API Endpoint URL"
                            fullWidth
                            value={apiConfig.url}
                            onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://api.example.com/users"
                            helperText="Enter the full API endpoint URL"
                        />

                        {/* HTTP Method */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>HTTP Method</InputLabel>
                                <Select
                                    value={apiConfig.method}
                                    onChange={(e) => setApiConfig(prev => ({ ...prev, method: e.target.value }))}
                                    label="HTTP Method"
                                >
                                    <MenuItem value="GET">GET</MenuItem>
                                    <MenuItem value="POST">POST</MenuItem>
                                    <MenuItem value="PUT">PUT</MenuItem>
                                    <MenuItem value="PATCH">PATCH</MenuItem>
                                    <MenuItem value="DELETE">DELETE</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Batch Size"
                                type="number"
                                value={apiConfig.batchSize}
                                onChange={(e) => setApiConfig(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
                                inputProps={{ min: 1, max: 100 }}
                                helperText="Records per batch"
                                sx={{ width: 120 }}
                            />

                            <TextField
                                label="Delay (ms)"
                                type="number"
                                value={apiConfig.delayBetweenRequests}
                                onChange={(e) => setApiConfig(prev => ({ ...prev, delayBetweenRequests: Number(e.target.value) }))}
                                inputProps={{ min: 0, max: 5000 }}
                                helperText="Delay between requests"
                                sx={{ width: 120 }}
                            />
                        </Box>

                        {/* Authentication */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Authentication</Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Auth Type</InputLabel>
                                <Select
                                    value={apiConfig.authType}
                                    onChange={(e) => setApiConfig(prev => ({ ...prev, authType: e.target.value }))}
                                    label="Auth Type"
                                >
                                    <MenuItem value="none">None</MenuItem>
                                    <MenuItem value="bearer">Bearer Token</MenuItem>
                                    <MenuItem value="apiKey">API Key</MenuItem>
                                </Select>
                            </FormControl>

                            {apiConfig.authType === 'bearer' && (
                                <TextField
                                    label="Bearer Token"
                                    fullWidth
                                    type="password"
                                    value={apiConfig.authToken}
                                    onChange={(e) => setApiConfig(prev => ({ ...prev, authToken: e.target.value }))}
                                    placeholder="Enter your bearer token"
                                />
                            )}

                            {apiConfig.authType === 'apiKey' && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="API Key Header"
                                        value={apiConfig.apiKeyHeader}
                                        onChange={(e) => setApiConfig(prev => ({ ...prev, apiKeyHeader: e.target.value }))}
                                        placeholder="X-API-Key"
                                        sx={{ width: 150 }}
                                    />
                                    <TextField
                                        label="API Key"
                                        fullWidth
                                        type="password"
                                        value={apiConfig.apiKey}
                                        onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                        placeholder="Enter your API key"
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Custom Headers */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Custom Headers</Typography>
                            {apiConfig.headers.map((header, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                    <TextField
                                        label="Header Name"
                                        value={header.key}
                                        onChange={(e) => {
                                            const newHeaders = [...apiConfig.headers];
                                            newHeaders[index].key = e.target.value;
                                            setApiConfig(prev => ({ ...prev, headers: newHeaders }));
                                        }}
                                        placeholder="Content-Type"
                                        sx={{ width: 200 }}
                                    />
                                    <TextField
                                        label="Header Value"
                                        fullWidth
                                        value={header.value}
                                        onChange={(e) => {
                                            const newHeaders = [...apiConfig.headers];
                                            newHeaders[index].value = e.target.value;
                                            setApiConfig(prev => ({ ...prev, headers: newHeaders }));
                                        }}
                                        placeholder="application/json"
                                    />
                                    <IconButton
                                        onClick={() => {
                                            const newHeaders = apiConfig.headers.filter((_, i) => i !== index);
                                            setApiConfig(prev => ({ ...prev, headers: newHeaders }));
                                        }}
                                        disabled={apiConfig.headers.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                onClick={() => {
                                    setApiConfig(prev => ({
                                        ...prev,
                                        headers: [...prev.headers, { key: '', value: '' }]
                                    }));
                                }}
                                startIcon={<AddIcon />}
                                size="small"
                            >
                                Add Header
                            </Button>
                        </Box>

                        <Alert severity="info">
                            <Typography variant="body2">
                                <strong>API Integration Info:</strong><br />
                                • Data will be sent as JSON payload for POST/PUT/PATCH requests<br />
                                • Each record will be sent individually or in batches as configured<br />
                                • Progress will be shown for the entire API operation<br />
                                • Results will include success/failure status for each record
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                        <Button
                            onClick={() => setTemplateDialogOpen(true)}
                            variant="outlined"
                            color="secondary"
                            size="small"
                        >
                            Save as Template
                        </Button>
                        {apiTemplates.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Load Template</InputLabel>
                                <Select
                                    value={selectedTemplate || ''}
                                    label="Load Template"
                                    onChange={(e) => {
                                        const templateId = e.target.value;
                                        if (templateId) {
                                            loadTemplate(templateId);
                                            setSelectedTemplate(null);
                                        }
                                    }}
                                >
                                    {apiTemplates.map((template) => (
                                        <MenuItem key={template.id} value={template.id}>
                                            {template.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                    <Button onClick={() => setApiDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSendToApi}
                        variant="contained"
                        disabled={!apiConfig.url.trim()}
                    >
                        Send to API
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Save Template Dialog */}
            <Dialog
                open={templateDialogOpen}
                onClose={() => setTemplateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">Save API Configuration as Template</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Template Name"
                            fullWidth
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="e.g., Production API, Test Endpoint"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Description (Optional)"
                            fullWidth
                            multiline
                            rows={3}
                            value={templateDescription}
                            onChange={(e) => setTemplateDescription(e.target.value)}
                            placeholder="Brief description of this API configuration..."
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                This will save your current API configuration (URL, method, headers, authentication, etc.) as a reusable template.
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTemplateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={saveAsTemplate}
                        variant="contained"
                        disabled={!templateName.trim()}
                    >
                        Save Template
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Template Management Dialog */}
            <Dialog
                open={templateManagementOpen}
                onClose={() => setTemplateManagementOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">API Templates</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your saved API configurations
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {apiTemplates.length === 0 ? (
                            <Alert severity="info">
                                <Typography variant="body2">
                                    No templates saved yet. Configure an API endpoint and save it as a template to get started.
                                </Typography>
                            </Alert>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {apiTemplates.map((template) => (
                                    <Card key={template.id} sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {template.name}
                                                </Typography>
                                                {template.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {template.description}
                                                    </Typography>
                                                )}
                                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <Chip
                                                        label={`${template.config.method} ${template.config.url}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={`Auth: ${template.config.authType}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Created: {template.createdAt.toLocaleDateString()}
                                                    </Typography>
                                                    {template.lastUsed && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Last used: {template.lastUsed.toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => downloadTemplates([template], 'api')}
                                                    startIcon={<GetAppIcon />}
                                                >
                                                    Download
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        loadTemplate(template.id);
                                                        setTemplateManagementOpen(false);
                                                    }}
                                                >
                                                    Load
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
                                                            deleteTemplate(template.id);
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                        <Button
                            onClick={() => downloadTemplates(apiTemplates, 'api')}
                            variant="outlined"
                            color="primary"
                            disabled={apiTemplates.length === 0}
                            startIcon={<GetAppIcon />}
                        >
                            Download All
                        </Button>
                        <Button
                            onClick={() => document.getElementById('api-template-import')?.click()}
                            variant="outlined"
                            color="secondary"
                            startIcon={<PublishIcon />}
                        >
                            Import
                        </Button>
                        <input
                            id="api-template-import"
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={(e) => importTemplates(e, 'api')}
                        />
                    </Box>
                    <Button onClick={() => setTemplateManagementOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* API Progress */}
            {isSendingToApi && (
                <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
                    <Alert severity="info">
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Sending to API...</strong>
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={apiProgress}
                            sx={{ mb: 1 }}
                        />
                        <Typography variant="caption">
                            {apiProgress}% complete
                        </Typography>
                    </Alert>
                </Box>
            )}

            {/* API Response Viewer Dialog */}
            <Dialog
                open={responseViewerOpen}
                onClose={() => setResponseViewerOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">API Response Viewer</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                                label={`${apiResults.filter(r => r.success).length} Success`}
                                color="success"
                                size="small"
                            />
                            <Chip
                                label={`${apiResults.filter(r => !r.success).length} Failed`}
                                color="error"
                                size="small"
                            />
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        {/* Filters and Search */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Filter</InputLabel>
                                <Select
                                    value={responseFilter}
                                    label="Filter"
                                    onChange={(e) => setResponseFilter(e.target.value as 'all' | 'success' | 'error')}
                                >
                                    <MenuItem value="all">All Results</MenuItem>
                                    <MenuItem value="success">Success Only</MenuItem>
                                    <MenuItem value="error">Errors Only</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                placeholder="Search responses..."
                                value={responseSearch}
                                onChange={(e) => setResponseSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: 200 }}
                            />
                        </Box>

                        {/* Results List */}
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {apiResults
                                .filter(result => {
                                    if (responseFilter === 'success' && !result.success) return false;
                                    if (responseFilter === 'error' && result.success) return false;
                                    if (responseSearch) {
                                        const searchLower = responseSearch.toLowerCase();
                                        return (
                                            result.recordIndex.toString().includes(searchLower) ||
                                            result.status.toString().includes(searchLower) ||
                                            JSON.stringify(result.response).toLowerCase().includes(searchLower) ||
                                            (result.error && result.error.toLowerCase().includes(searchLower))
                                        );
                                    }
                                    return true;
                                })
                                .map((result, index) => (
                                    <Card
                                        key={index}
                                        sx={{
                                            mb: 1,
                                            border: 1,
                                            borderColor: result.success ? 'success.main' : 'error.main',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                        onClick={() => setSelectedResponse(result)}
                                    >
                                        <CardContent sx={{ py: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={`Record ${result.recordIndex + 1}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={`HTTP ${result.status}`}
                                                        size="small"
                                                        color={result.success ? 'success' : 'error'}
                                                    />
                                                    {result.responseTime && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {result.responseTime}ms
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {result.success ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <ErrorIcon color="error" />
                                                    )}
                                                    <Typography variant="body2" color="text.secondary">
                                                        {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {result.error && (
                                                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                    {result.error}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResponseViewerOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detailed Response Dialog */}
            <Dialog
                open={!!selectedResponse}
                onClose={() => setSelectedResponse(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">
                        API Response Details - Record {selectedResponse?.recordIndex ? selectedResponse.recordIndex + 1 : ''}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedResponse && (
                        <Box>
                            {/* Status and Timing */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Chip
                                    label={`HTTP ${selectedResponse.status}`}
                                    color={selectedResponse.success ? 'success' : 'error'}
                                />
                                {selectedResponse.responseTime && (
                                    <Chip
                                        label={`${selectedResponse.responseTime}ms`}
                                        variant="outlined"
                                    />
                                )}
                                <Chip
                                    label={selectedResponse.timestamp ? new Date(selectedResponse.timestamp).toLocaleString() : ''}
                                    variant="outlined"
                                />
                            </Box>

                            {/* Request Data */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Request Data
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {JSON.stringify(selectedResponse.requestData, null, 2)}
                                    </pre>
                                </Paper>
                            </Box>

                            {/* Response Data */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Response Data
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: selectedResponse.success ? 'success.50' : 'error.50' }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {typeof selectedResponse.response === 'string'
                                            ? selectedResponse.response
                                            : JSON.stringify(selectedResponse.response, null, 2)
                                        }
                                    </pre>
                                </Paper>
                            </Box>

                            {/* Error Details */}
                            {selectedResponse.error && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom color="error">
                                        Error Details
                                    </Typography>
                                    <Alert severity="error">
                                        <Typography variant="body2">
                                            {selectedResponse.error}
                                        </Typography>
                                    </Alert>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedResponse(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Webhook Integration Dialog */}
            <Dialog
                open={webhookDialogOpen}
                onClose={() => setWebhookDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">Webhook Integration Configuration</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Send generated data to webhook endpoints with retry logic and signature verification
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* Webhook URL */}
                        <TextField
                            label="Webhook URL"
                            fullWidth
                            value={webhookConfig.url}
                            onChange={(e) => setWebhookConfig(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://your-webhook-endpoint.com/webhook"
                            sx={{ mb: 3 }}
                        />

                        {/* HTTP Method */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>HTTP Method</InputLabel>
                            <Select
                                value={webhookConfig.method}
                                label="HTTP Method"
                                onChange={(e) => setWebhookConfig(prev => ({ ...prev, method: e.target.value }))}
                            >
                                <MenuItem value="POST">POST</MenuItem>
                                <MenuItem value="PUT">PUT</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Authentication */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Authentication</Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Auth Type</InputLabel>
                                <Select
                                    value={webhookConfig.authType}
                                    label="Auth Type"
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, authType: e.target.value }))}
                                >
                                    <MenuItem value="none">None</MenuItem>
                                    <MenuItem value="bearer">Bearer Token</MenuItem>
                                    <MenuItem value="apiKey">API Key</MenuItem>
                                </Select>
                            </FormControl>

                            {webhookConfig.authType === 'bearer' && (
                                <TextField
                                    label="Bearer Token"
                                    fullWidth
                                    type="password"
                                    value={webhookConfig.authToken}
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, authToken: e.target.value }))}
                                    placeholder="Enter your bearer token"
                                />
                            )}

                            {webhookConfig.authType === 'apiKey' && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="API Key Header"
                                        value={webhookConfig.apiKeyHeader}
                                        onChange={(e) => setWebhookConfig(prev => ({ ...prev, apiKeyHeader: e.target.value }))}
                                        placeholder="X-API-Key"
                                        sx={{ width: 150 }}
                                    />
                                    <TextField
                                        label="API Key"
                                        fullWidth
                                        type="password"
                                        value={webhookConfig.apiKey}
                                        onChange={(e) => setWebhookConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                        placeholder="Enter your API key"
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Webhook Signature */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Webhook Signature (Optional)</Typography>
                            <TextField
                                label="Secret Key"
                                fullWidth
                                type="password"
                                value={webhookConfig.secret}
                                onChange={(e) => setWebhookConfig(prev => ({ ...prev, secret: e.target.value }))}
                                placeholder="Secret key for HMAC-SHA256 signature"
                                sx={{ mb: 1 }}
                            />
                            <TextField
                                label="Signature Header"
                                fullWidth
                                value={webhookConfig.signatureHeader}
                                onChange={(e) => setWebhookConfig(prev => ({ ...prev, signatureHeader: e.target.value }))}
                                placeholder="X-Webhook-Signature"
                            />
                        </Box>

                        {/* Custom Headers */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Custom Headers</Typography>
                            {webhookConfig.headers.map((header, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                    <TextField
                                        label="Header Name"
                                        value={header.key}
                                        onChange={(e) => {
                                            const newHeaders = [...webhookConfig.headers];
                                            newHeaders[index].key = e.target.value;
                                            setWebhookConfig(prev => ({ ...prev, headers: newHeaders }));
                                        }}
                                        placeholder="Content-Type"
                                        sx={{ width: 200 }}
                                    />
                                    <TextField
                                        label="Header Value"
                                        fullWidth
                                        value={header.value}
                                        onChange={(e) => {
                                            const newHeaders = [...webhookConfig.headers];
                                            newHeaders[index].value = e.target.value;
                                            setWebhookConfig(prev => ({ ...prev, headers: newHeaders }));
                                        }}
                                        placeholder="application/json"
                                    />
                                    <IconButton
                                        onClick={() => {
                                            const newHeaders = webhookConfig.headers.filter((_, i) => i !== index);
                                            setWebhookConfig(prev => ({ ...prev, headers: newHeaders }));
                                        }}
                                        disabled={webhookConfig.headers.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                onClick={() => {
                                    setWebhookConfig(prev => ({
                                        ...prev,
                                        headers: [...prev.headers, { key: '', value: '' }]
                                    }));
                                }}
                                startIcon={<AddIcon />}
                                size="small"
                            >
                                Add Header
                            </Button>
                        </Box>

                        {/* Advanced Settings */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Advanced Settings</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <TextField
                                    label="Batch Size"
                                    type="number"
                                    size="small"
                                    value={webhookConfig.batchSize}
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
                                    inputProps={{ min: 1, max: 100 }}
                                    sx={{ width: 120 }}
                                />
                                <TextField
                                    label="Delay (ms)"
                                    type="number"
                                    size="small"
                                    value={webhookConfig.delayBetweenRequests}
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, delayBetweenRequests: Number(e.target.value) }))}
                                    inputProps={{ min: 0, max: 10000 }}
                                    sx={{ width: 120 }}
                                />
                                <TextField
                                    label="Max Retries"
                                    type="number"
                                    size="small"
                                    value={webhookConfig.maxRetries}
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, maxRetries: Number(e.target.value) }))}
                                    inputProps={{ min: 0, max: 10 }}
                                    sx={{ width: 120 }}
                                />
                                <TextField
                                    label="Retry Delay (ms)"
                                    type="number"
                                    size="small"
                                    value={webhookConfig.retryDelay}
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, retryDelay: Number(e.target.value) }))}
                                    inputProps={{ min: 100, max: 30000 }}
                                    sx={{ width: 140 }}
                                />
                                <TextField
                                    label="Timeout (ms)"
                                    type="number"
                                    size="small"
                                    value={webhookConfig.timeout}
                                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                                    inputProps={{ min: 1000, max: 120000 }}
                                    sx={{ width: 130 }}
                                />
                            </Box>
                        </Box>

                        <Alert severity="info">
                            <Typography variant="body2">
                                <strong>Webhook Integration Info:</strong><br />
                                • Data will be sent as JSON payload to your webhook endpoint<br />
                                • Automatic retry logic for failed deliveries<br />
                                • Optional HMAC-SHA256 signature verification<br />
                                • Progress tracking and detailed delivery reports
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                        <Button
                            onClick={() => setWebhookTemplateDialogOpen(true)}
                            variant="outlined"
                            color="secondary"
                            size="small"
                        >
                            Save as Template
                        </Button>
                        {webhookTemplates.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Load Template</InputLabel>
                                <Select
                                    value={selectedWebhookTemplate || ''}
                                    label="Load Template"
                                    onChange={(e) => {
                                        const templateId = e.target.value;
                                        if (templateId) {
                                            loadWebhookTemplate(templateId);
                                            setSelectedWebhookTemplate(null);
                                        }
                                    }}
                                >
                                    {webhookTemplates.map((template) => (
                                        <MenuItem key={template.id} value={template.id}>
                                            {template.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                    <Button onClick={() => setWebhookDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSendToWebhook}
                        variant="contained"
                        disabled={!webhookConfig.url.trim()}
                    >
                        Send to Webhook
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Save Webhook Template Dialog */}
            <Dialog
                open={webhookTemplateDialogOpen}
                onClose={() => setWebhookTemplateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">Save Webhook Configuration as Template</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Template Name"
                            fullWidth
                            value={webhookTemplateName}
                            onChange={(e) => setWebhookTemplateName(e.target.value)}
                            placeholder="e.g., Production Webhook, Slack Notifications"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Description (Optional)"
                            fullWidth
                            multiline
                            rows={3}
                            value={webhookTemplateDescription}
                            onChange={(e) => setWebhookTemplateDescription(e.target.value)}
                            placeholder="Brief description of this webhook configuration..."
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                This will save your current webhook configuration (URL, authentication, headers, retry settings, etc.) as a reusable template.
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWebhookTemplateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={saveWebhookAsTemplate}
                        variant="contained"
                        disabled={!webhookTemplateName.trim()}
                    >
                        Save Template
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Webhook Template Management Dialog */}
            <Dialog
                open={webhookTemplateManagementOpen}
                onClose={() => setWebhookTemplateManagementOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">Webhook Templates</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your saved webhook configurations
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {webhookTemplates.length === 0 ? (
                            <Alert severity="info">
                                <Typography variant="body2">
                                    No webhook templates saved yet. Configure a webhook endpoint and save it as a template to get started.
                                </Typography>
                            </Alert>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {webhookTemplates.map((template) => (
                                    <Card key={template.id} sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {template.name}
                                                </Typography>
                                                {template.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {template.description}
                                                    </Typography>
                                                )}
                                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <Chip
                                                        label={`${template.config.method} ${template.config.url}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={`Auth: ${template.config.authType}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    {template.config.secret && (
                                                        <Chip
                                                            label="Has Signature"
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    <Chip
                                                        label={`Retry: ${template.config.maxRetries}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Created: {template.createdAt.toLocaleDateString()}
                                                    </Typography>
                                                    {template.lastUsed && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Last used: {template.lastUsed.toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => downloadTemplates([template], 'webhook')}
                                                    startIcon={<GetAppIcon />}
                                                >
                                                    Download
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        loadWebhookTemplate(template.id);
                                                        setWebhookTemplateManagementOpen(false);
                                                    }}
                                                >
                                                    Load
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete the webhook template "${template.name}"?`)) {
                                                            deleteWebhookTemplate(template.id);
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                        <Button
                            onClick={() => downloadTemplates(webhookTemplates, 'webhook')}
                            variant="outlined"
                            color="primary"
                            disabled={webhookTemplates.length === 0}
                            startIcon={<GetAppIcon />}
                        >
                            Download All
                        </Button>
                        <Button
                            onClick={() => document.getElementById('webhook-template-import')?.click()}
                            variant="outlined"
                            color="secondary"
                            startIcon={<PublishIcon />}
                        >
                            Import
                        </Button>
                        <input
                            id="webhook-template-import"
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={(e) => importTemplates(e, 'webhook')}
                        />
                    </Box>
                    <Button onClick={() => setWebhookTemplateManagementOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Webhook Progress */}
            {isSendingToWebhook && (
                <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
                    <Alert severity="info">
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Sending to Webhook...</strong>
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={webhookProgress}
                            sx={{ mb: 1 }}
                        />
                        <Typography variant="caption">
                            {webhookProgress}% complete
                        </Typography>
                    </Alert>
                </Box>
            )}

            {/* Webhook Response Viewer Dialog */}
            <Dialog
                open={webhookResponseViewerOpen}
                onClose={() => setWebhookResponseViewerOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Webhook Response Viewer</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                                label={`${webhookResults.filter(r => r.success).length} Success`}
                                color="success"
                                size="small"
                            />
                            <Chip
                                label={`${webhookResults.filter(r => !r.success).length} Failed`}
                                color="error"
                                size="small"
                            />
                            <Chip
                                label={`${webhookResults.reduce((sum, r) => sum + r.retryCount, 0)} Retries`}
                                color="warning"
                                size="small"
                            />
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        {/* Filters and Search */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Filter</InputLabel>
                                <Select
                                    value={responseFilter}
                                    label="Filter"
                                    onChange={(e) => setResponseFilter(e.target.value as 'all' | 'success' | 'error')}
                                >
                                    <MenuItem value="all">All Results</MenuItem>
                                    <MenuItem value="success">Success Only</MenuItem>
                                    <MenuItem value="error">Errors Only</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                placeholder="Search responses..."
                                value={responseSearch}
                                onChange={(e) => setResponseSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: 200 }}
                            />
                        </Box>

                        {/* Results List */}
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {webhookResults
                                .filter(result => {
                                    if (responseFilter === 'success' && !result.success) return false;
                                    if (responseFilter === 'error' && result.success) return false;
                                    if (responseSearch) {
                                        const searchLower = responseSearch.toLowerCase();
                                        return (
                                            result.recordIndex.toString().includes(searchLower) ||
                                            result.status.toString().includes(searchLower) ||
                                            JSON.stringify(result.response).toLowerCase().includes(searchLower) ||
                                            (result.error && result.error.toLowerCase().includes(searchLower))
                                        );
                                    }
                                    return true;
                                })
                                .map((result, index) => (
                                    <Card
                                        key={index}
                                        sx={{
                                            mb: 1,
                                            border: 1,
                                            borderColor: result.success ? 'success.main' : 'error.main',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                        onClick={() => setSelectedWebhookResponse(result)}
                                    >
                                        <CardContent sx={{ py: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={`Record ${result.recordIndex + 1}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={`HTTP ${result.status}`}
                                                        size="small"
                                                        color={result.success ? 'success' : 'error'}
                                                    />
                                                    {result.responseTime && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {result.responseTime}ms
                                                        </Typography>
                                                    )}
                                                    {result.retryCount > 0 && (
                                                        <Chip
                                                            label={`${result.retryCount} retries`}
                                                            size="small"
                                                            color="warning"
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {result.success ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <ErrorIcon color="error" />
                                                    )}
                                                    <Typography variant="body2" color="text.secondary">
                                                        {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {result.error && (
                                                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                    {result.error}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWebhookResponseViewerOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detailed Webhook Response Dialog */}
            <Dialog
                open={!!selectedWebhookResponse}
                onClose={() => setSelectedWebhookResponse(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">
                        Webhook Response Details - Record {selectedWebhookResponse?.recordIndex ? selectedWebhookResponse.recordIndex + 1 : ''}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedWebhookResponse && (
                        <Box>
                            {/* Status and Timing */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <Chip
                                    label={`HTTP ${selectedWebhookResponse.status}`}
                                    color={selectedWebhookResponse.success ? 'success' : 'error'}
                                />
                                {selectedWebhookResponse.responseTime && (
                                    <Chip
                                        label={`${selectedWebhookResponse.responseTime}ms`}
                                        variant="outlined"
                                    />
                                )}
                                {selectedWebhookResponse.retryCount > 0 && (
                                    <Chip
                                        label={`${selectedWebhookResponse.retryCount} retries`}
                                        color="warning"
                                    />
                                )}
                                <Chip
                                    label={selectedWebhookResponse.timestamp ? new Date(selectedWebhookResponse.timestamp).toLocaleString() : ''}
                                    variant="outlined"
                                />
                            </Box>

                            {/* Request Data */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Request Data
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {JSON.stringify(selectedWebhookResponse.requestData, null, 2)}
                                    </pre>
                                </Paper>
                            </Box>

                            {/* Webhook Signature */}
                            {selectedWebhookResponse.webhookSignature && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Webhook Signature
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            sha256={selectedWebhookResponse.webhookSignature}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}

                            {/* Response Data */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Response Data
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: selectedWebhookResponse.success ? 'success.50' : 'error.50' }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {typeof selectedWebhookResponse.response === 'string'
                                            ? selectedWebhookResponse.response
                                            : JSON.stringify(selectedWebhookResponse.response, null, 2)
                                        }
                                    </pre>
                                </Paper>
                            </Box>

                            {/* Error Details */}
                            {selectedWebhookResponse.error && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom color="error">
                                        Error Details
                                    </Typography>
                                    <Alert severity="error">
                                        <Typography variant="body2">
                                            {selectedWebhookResponse.error}
                                        </Typography>
                                    </Alert>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedWebhookResponse(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExportSection;