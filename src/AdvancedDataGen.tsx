import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  Accordion, AccordionSummary, AccordionDetails, Switch, FormControlLabel,
  Alert, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';

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

interface Relationship {
  id: string;
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  parentTable: string;
  childTable: string;
  parentColumn: string;
  childColumn: string;
  cascadeDelete?: boolean;
}

interface Sequence {
  id: string;
  name: string;
  type: 'auto-increment' | 'custom-pattern' | 'uuid' | 'timestamp';
  startValue?: number;
  increment?: number;
  pattern?: string;
  prefix?: string;
  suffix?: string;
}

interface CustomFormat {
  id: string;
  name: string;
  pattern: string;
  description: string;
  example: string;
}

interface Localization {
  language: string;
  country: string;
  timezone: string;
}

interface AdvancedDataGenProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  open: boolean;
  onClose: () => void;
}

const AdvancedDataGen: React.FC<AdvancedDataGenProps> = ({
  columns,
  setColumns,
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'relationships' | 'sequences' | 'formats' | 'localization'>('relationships');

  // Relationships state
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipDialog, setRelationshipDialog] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [relationshipForm, setRelationshipForm] = useState<Partial<Relationship>>({
    type: 'one-to-many',
    cascadeDelete: false
  });

  // Sequences state
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [sequenceDialog, setSequenceDialog] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [sequenceForm, setSequenceForm] = useState<Partial<Sequence>>({
    type: 'auto-increment',
    startValue: 1,
    increment: 1
  });

  // Custom formats state
  const [customFormats, setCustomFormats] = useState<CustomFormat[]>([
    {
      id: 'us-phone',
      name: 'US Phone Number',
      pattern: '(###) ###-####',
      description: 'Standard US phone number format',
      example: '(555) 123-4567'
    },
    {
      id: 'ssn',
      name: 'Social Security Number',
      pattern: '###-##-####',
      description: 'US Social Security Number format',
      example: '123-45-6789'
    },
    {
      id: 'credit-card',
      name: 'Credit Card Number',
      pattern: '#### #### #### ####',
      description: 'Credit card number format',
      example: '4111 1111 1111 1111'
    }
  ]);
  const [formatDialog, setFormatDialog] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | null>(null);
  const [formatForm, setFormatForm] = useState<Partial<CustomFormat>>({});

  // Localization state
  const [localization, setLocalization] = useState<Localization>({
    language: 'en',
    country: 'US',
    timezone: 'America/New_York'
  });

  // Add new data types for advanced generation
  const advancedDataTypes = [
    'Auto-Increment ID',
    'UUID v4',
    'Timestamp',
    'Custom Sequence',
    'Custom Format',
    'Foreign Key',
    'Parent Reference',
    'Localized Name',
    'Localized Address',
    'Localized Phone'
  ];

  const handleAddRelationship = () => {
    setEditingRelationship(null);
    setRelationshipForm({
      type: 'one-to-many',
      cascadeDelete: false
    });
    setRelationshipDialog(true);
  };

  const handleEditRelationship = (relationship: Relationship) => {
    setEditingRelationship(relationship);
    setRelationshipForm({ ...relationship });
    setRelationshipDialog(true);
  };

  const handleSaveRelationship = () => {
    if (!relationshipForm.name || !relationshipForm.parentTable || !relationshipForm.childTable) {
      return;
    }

    const newRelationship: Relationship = {
      id: editingRelationship?.id || `rel_${Date.now()}`,
      name: relationshipForm.name,
      type: relationshipForm.type || 'one-to-many',
      parentTable: relationshipForm.parentTable,
      childTable: relationshipForm.childTable,
      parentColumn: relationshipForm.parentColumn || 'id',
      childColumn: relationshipForm.childColumn || `${relationshipForm.parentTable}_id`,
      cascadeDelete: relationshipForm.cascadeDelete
    };

    if (editingRelationship) {
      setRelationships(prev => prev.map(rel =>
        rel.id === editingRelationship.id ? newRelationship : rel
      ));
    } else {
      setRelationships(prev => [...prev, newRelationship]);
    }

    setRelationshipDialog(false);
  };

  const handleDeleteRelationship = (id: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== id));
  };

  const handleAddSequence = () => {
    setEditingSequence(null);
    setSequenceForm({
      type: 'auto-increment',
      startValue: 1,
      increment: 1
    });
    setSequenceDialog(true);
  };

  const handleEditSequence = (sequence: Sequence) => {
    setEditingSequence(sequence);
    setSequenceForm({ ...sequence });
    setSequenceDialog(true);
  };

  const handleSaveSequence = () => {
    if (!sequenceForm.name) {
      return;
    }

    const newSequence: Sequence = {
      id: editingSequence?.id || `seq_${Date.now()}`,
      name: sequenceForm.name,
      type: sequenceForm.type || 'auto-increment',
      startValue: sequenceForm.startValue,
      increment: sequenceForm.increment,
      pattern: sequenceForm.pattern,
      prefix: sequenceForm.prefix,
      suffix: sequenceForm.suffix
    };

    if (editingSequence) {
      setSequences(prev => prev.map(seq =>
        seq.id === editingSequence.id ? newSequence : seq
      ));
    } else {
      setSequences(prev => [...prev, newSequence]);
    }

    setSequenceDialog(false);
  };

  const handleDeleteSequence = (id: string) => {
    setSequences(prev => prev.filter(seq => seq.id !== id));
  };

  const handleAddFormat = () => {
    setEditingFormat(null);
    setFormatForm({});
    setFormatDialog(true);
  };

  const handleEditFormat = (format: CustomFormat) => {
    setEditingFormat(format);
    setFormatForm({ ...format });
    setFormatDialog(true);
  };

  const handleSaveFormat = () => {
    if (!formatForm.name || !formatForm.pattern) {
      return;
    }

    const newFormat: CustomFormat = {
      id: editingFormat?.id || `fmt_${Date.now()}`,
      name: formatForm.name,
      pattern: formatForm.pattern,
      description: formatForm.description || '',
      example: formatForm.example || ''
    };

    if (editingFormat) {
      setCustomFormats(prev => prev.map(fmt =>
        fmt.id === editingFormat.id ? newFormat : fmt
      ));
    } else {
      setCustomFormats(prev => [...prev, newFormat]);
    }

    setFormatDialog(false);
  };

  const handleDeleteFormat = (id: string) => {
    setCustomFormats(prev => prev.filter(fmt => fmt.id !== id));
  };

  const addAdvancedColumn = (type: string) => {
    const newColumn: Column = {
      name: `${type.replace(/\s+/g, '_').toLowerCase()}_${columns.length + 1}`,
      type: type,
      constraints: {}
    };
    setColumns([...columns, newColumn]);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          Advanced Data Generation Settings
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Configure advanced data generation features including relationships, sequences, custom formats, and localization.
            </Typography>

            {/* Quick Add Advanced Types */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Add Advanced Data Types</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {advancedDataTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => addAdvancedColumn(type)}
                    color="primary"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Configuration Sections */}
            <Accordion expanded={activeTab === 'relationships'} onChange={() => setActiveTab('relationships')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Relationships & Foreign Keys</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRelationship}
                    sx={{ mb: 2 }}
                  >
                    Add Relationship
                  </Button>

                  {relationships.length === 0 ? (
                    <Alert severity="info">
                      No relationships defined. Add relationships to create linked data between tables.
                    </Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {relationships.map((rel) => (
                        <Chip
                          key={rel.id}
                          label={`${rel.name} (${rel.type})`}
                          onDelete={() => handleDeleteRelationship(rel.id)}
                          onClick={() => handleEditRelationship(rel)}
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={activeTab === 'sequences'} onChange={() => setActiveTab('sequences')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Sequences & Auto-Increment</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSequence}
                    sx={{ mb: 2 }}
                  >
                    Add Sequence
                  </Button>

                  {sequences.length === 0 ? (
                    <Alert severity="info">
                      No sequences defined. Add sequences for auto-incrementing IDs and custom patterns.
                    </Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {sequences.map((seq) => (
                        <Chip
                          key={seq.id}
                          label={`${seq.name} (${seq.type})`}
                          onDelete={() => handleDeleteSequence(seq.id)}
                          onClick={() => handleEditSequence(seq)}
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={activeTab === 'formats'} onChange={() => setActiveTab('formats')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Custom Formats</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddFormat}
                    sx={{ mb: 2 }}
                  >
                    Add Custom Format
                  </Button>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {customFormats.map((fmt) => (
                      <Chip
                        key={fmt.id}
                        label={`${fmt.name}: ${fmt.example}`}
                        onDelete={() => handleDeleteFormat(fmt.id)}
                        onClick={() => handleEditFormat(fmt)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={activeTab === 'localization'} onChange={() => setActiveTab('localization')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Localization Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={localization.language}
                      onChange={(e) => setLocalization(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                      <MenuItem value="it">Italian</MenuItem>
                      <MenuItem value="pt">Portuguese</MenuItem>
                      <MenuItem value="ru">Russian</MenuItem>
                      <MenuItem value="ja">Japanese</MenuItem>
                      <MenuItem value="ko">Korean</MenuItem>
                      <MenuItem value="zh">Chinese</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={localization.country}
                      onChange={(e) => setLocalization(prev => ({ ...prev, country: e.target.value }))}
                    >
                      <MenuItem value="US">United States</MenuItem>
                      <MenuItem value="GB">United Kingdom</MenuItem>
                      <MenuItem value="CA">Canada</MenuItem>
                      <MenuItem value="AU">Australia</MenuItem>
                      <MenuItem value="DE">Germany</MenuItem>
                      <MenuItem value="FR">France</MenuItem>
                      <MenuItem value="ES">Spain</MenuItem>
                      <MenuItem value="IT">Italy</MenuItem>
                      <MenuItem value="BR">Brazil</MenuItem>
                      <MenuItem value="MX">Mexico</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={localization.timezone}
                      onChange={(e) => setLocalization(prev => ({ ...prev, timezone: e.target.value }))}
                    >
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      <MenuItem value="Europe/London">London</MenuItem>
                      <MenuItem value="Europe/Paris">Paris</MenuItem>
                      <MenuItem value="Europe/Berlin">Berlin</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                      <MenuItem value="Asia/Shanghai">Shanghai</MenuItem>
                      <MenuItem value="Australia/Sydney">Sydney</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Relationship Dialog */}
      <Dialog open={relationshipDialog} onClose={() => setRelationshipDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRelationship ? 'Edit Relationship' : 'Add Relationship'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Relationship Name"
              value={relationshipForm.name || ''}
              onChange={(e) => setRelationshipForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Relationship Type</InputLabel>
              <Select
                value={relationshipForm.type || 'one-to-many'}
                onChange={(e) => setRelationshipForm(prev => ({ ...prev, type: e.target.value as Relationship['type'] }))}
              >
                <MenuItem value="one-to-one">One to One</MenuItem>
                <MenuItem value="one-to-many">One to Many</MenuItem>
                <MenuItem value="many-to-one">Many to One</MenuItem>
                <MenuItem value="many-to-many">Many to Many</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Parent Table"
              value={relationshipForm.parentTable || ''}
              onChange={(e) => setRelationshipForm(prev => ({ ...prev, parentTable: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Child Table"
              value={relationshipForm.childTable || ''}
              onChange={(e) => setRelationshipForm(prev => ({ ...prev, childTable: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Parent Column"
              value={relationshipForm.parentColumn || ''}
              onChange={(e) => setRelationshipForm(prev => ({ ...prev, parentColumn: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Child Column"
              value={relationshipForm.childColumn || ''}
              onChange={(e) => setRelationshipForm(prev => ({ ...prev, childColumn: e.target.value }))}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={relationshipForm.cascadeDelete || false}
                  onChange={(e) => setRelationshipForm(prev => ({ ...prev, cascadeDelete: e.target.checked }))}
                />
              }
              label="Cascade Delete"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRelationshipDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRelationship} variant="contained">
            {editingRelationship ? 'Update' : 'Add'} Relationship
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sequence Dialog */}
      <Dialog open={sequenceDialog} onClose={() => setSequenceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSequence ? 'Edit Sequence' : 'Add Sequence'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Sequence Name"
              value={sequenceForm.name || ''}
              onChange={(e) => setSequenceForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Sequence Type</InputLabel>
              <Select
                value={sequenceForm.type || 'auto-increment'}
                onChange={(e) => setSequenceForm(prev => ({ ...prev, type: e.target.value as Sequence['type'] }))}
              >
                <MenuItem value="auto-increment">Auto-Increment</MenuItem>
                <MenuItem value="custom-pattern">Custom Pattern</MenuItem>
                <MenuItem value="uuid">UUID</MenuItem>
                <MenuItem value="timestamp">Timestamp</MenuItem>
              </Select>
            </FormControl>

            {sequenceForm.type === 'auto-increment' && (
              <>
                <TextField
                  label="Start Value"
                  type="number"
                  value={sequenceForm.startValue || 1}
                  onChange={(e) => setSequenceForm(prev => ({ ...prev, startValue: parseInt(e.target.value) }))}
                  fullWidth
                />

                <TextField
                  label="Increment"
                  type="number"
                  value={sequenceForm.increment || 1}
                  onChange={(e) => setSequenceForm(prev => ({ ...prev, increment: parseInt(e.target.value) }))}
                  fullWidth
                />
              </>
            )}

            {sequenceForm.type === 'custom-pattern' && (
              <>
                <TextField
                  label="Pattern"
                  value={sequenceForm.pattern || ''}
                  onChange={(e) => setSequenceForm(prev => ({ ...prev, pattern: e.target.value }))}
                  fullWidth
                  placeholder="e.g., INV-{YYYY}-{0000}"
                  helperText="Use {YYYY} for year, {MM} for month, {DD} for day, {0000} for padded number"
                />

                <TextField
                  label="Prefix"
                  value={sequenceForm.prefix || ''}
                  onChange={(e) => setSequenceForm(prev => ({ ...prev, prefix: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="Suffix"
                  value={sequenceForm.suffix || ''}
                  onChange={(e) => setSequenceForm(prev => ({ ...prev, suffix: e.target.value }))}
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSequenceDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSequence} variant="contained">
            {editingSequence ? 'Update' : 'Add'} Sequence
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Format Dialog */}
      <Dialog open={formatDialog} onClose={() => setFormatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFormat ? 'Edit Custom Format' : 'Add Custom Format'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Format Name"
              value={formatForm.name || ''}
              onChange={(e) => setFormatForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Pattern"
              value={formatForm.pattern || ''}
              onChange={(e) => setFormatForm(prev => ({ ...prev, pattern: e.target.value }))}
              fullWidth
              placeholder="e.g., ###-##-#### or (###) ###-####"
              helperText="Use # for digits, @ for letters, * for alphanumeric"
            />

            <TextField
              label="Description"
              value={formatForm.description || ''}
              onChange={(e) => setFormatForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Example"
              value={formatForm.example || ''}
              onChange={(e) => setFormatForm(prev => ({ ...prev, example: e.target.value }))}
              fullWidth
              placeholder="e.g., 123-45-6789"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormatDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFormat} variant="contained">
            {editingFormat ? 'Update' : 'Add'} Format
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdvancedDataGen;
