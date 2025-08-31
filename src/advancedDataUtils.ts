// Sequence Manager for Advanced Data Generation
class SequenceManager {
  private sequences: Map<string, { current: number; increment: number; pattern?: string; prefix?: string; suffix?: string }> = new Map();

  // Initialize or get a sequence
  getNextValue(sequenceName: string, config?: {
    startValue?: number;
    increment?: number;
    pattern?: string;
    prefix?: string;
    suffix?: string;
  }): string {
    if (!this.sequences.has(sequenceName)) {
      this.sequences.set(sequenceName, {
        current: (config?.startValue || 1) - (config?.increment || 1), // Will be incremented to startValue
        increment: config?.increment || 1,
        pattern: config?.pattern,
        prefix: config?.prefix || '',
        suffix: config?.suffix || ''
      });
    }

    const sequence = this.sequences.get(sequenceName)!;
    sequence.current += sequence.increment;

    if (sequence.pattern) {
      return this.formatWithPattern(sequence.current, sequence.pattern, sequence.prefix, sequence.suffix);
    }

    return `${sequence.prefix}${sequence.current}${sequence.suffix}`;
  }

  // Format value using a custom pattern
  private formatWithPattern(value: number, pattern: string, prefix: string = '', suffix: string = ''): string {
    let result = pattern;

    // Replace {YYYY} with current year
    result = result.replace(/{YYYY}/g, new Date().getFullYear().toString());

    // Replace {MM} with current month (padded)
    result = result.replace(/{MM}/g, (new Date().getMonth() + 1).toString().padStart(2, '0'));

    // Replace {DD} with current day (padded)
    result = result.replace(/{DD}/g, new Date().getDate().toString().padStart(2, '0'));

    // Replace {0000} patterns with padded numbers
    result = result.replace(/{0+}/g, (match) => {
      const length = match.length - 2; // Remove the { and }
      return value.toString().padStart(length, '0');
    });

    return `${prefix}${result}${suffix}`;
  }

  // Reset a sequence
  resetSequence(sequenceName: string, startValue: number = 1): void {
    if (this.sequences.has(sequenceName)) {
      this.sequences.get(sequenceName)!.current = startValue - this.sequences.get(sequenceName)!.increment;
    }
  }

  // Reset all sequences
  resetAll(): void {
    this.sequences.clear();
  }

  // Get current value of a sequence without incrementing
  getCurrentValue(sequenceName: string): number | null {
    return this.sequences.get(sequenceName)?.current || null;
  }
}

// Custom Format Manager
class FormatManager {
  private formats: Map<string, { pattern: string; description: string }> = new Map();

  // Register a custom format
  registerFormat(name: string, pattern: string, description: string = ''): void {
    this.formats.set(name, { pattern, description });
  }

  // Generate value using a custom format
  generateValue(formatName: string): string {
    const format = this.formats.get(formatName);
    if (!format) {
      throw new Error(`Format '${formatName}' not found`);
    }

    return this.applyPattern(format.pattern);
  }

  // Apply pattern to generate a value
  private applyPattern(pattern: string): string {
    let result = '';

    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];

      switch (char) {
        case '#':
          result += Math.floor(Math.random() * 10).toString();
          break;
        case '@':
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          result += letters[Math.floor(Math.random() * letters.length)];
          break;
        case '*':
          const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          result += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
          break;
        default:
          result += char;
          break;
      }
    }

    return result;
  }

  // Get all registered formats
  getFormats(): Array<{ name: string; pattern: string; description: string }> {
    return Array.from(this.formats.entries()).map(([name, format]) => ({
      name,
      pattern: format.pattern,
      description: format.description
    }));
  }

  // Remove a format
  removeFormat(name: string): void {
    this.formats.delete(name);
  }
}

// Relationship Manager for Foreign Keys
class RelationshipManager {
  private relationships: Map<string, {
    parentTable: string;
    childTable: string;
    parentColumn: string;
    childColumn: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  }> = new Map();

  private parentValues: Map<string, any[]> = new Map();

  // Register a relationship
  registerRelationship(
    name: string,
    parentTable: string,
    childTable: string,
    parentColumn: string,
    childColumn: string,
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' = 'one-to-many'
  ): void {
    this.relationships.set(name, {
      parentTable,
      childTable,
      parentColumn,
      childColumn,
      type
    });
  }

  // Store parent values for foreign key generation
  storeParentValues(tableName: string, values: any[]): void {
    this.parentValues.set(tableName, values);
  }

  // Generate foreign key value
  generateForeignKey(relationshipName: string): any {
    const relationship = this.relationships.get(relationshipName);
    if (!relationship) {
      throw new Error(`Relationship '${relationshipName}' not found`);
    }

    const parentValues = this.parentValues.get(relationship.parentTable);
    if (!parentValues || parentValues.length === 0) {
      return null; // No parent values available
    }

    // For simplicity, randomly select a parent value
    // In a real implementation, you might want more sophisticated logic
    const randomIndex = Math.floor(Math.random() * parentValues.length);
    return parentValues[randomIndex][relationship.parentColumn];
  }

  // Get all relationships
  getRelationships(): Array<{
    name: string;
    parentTable: string;
    childTable: string;
    parentColumn: string;
    childColumn: string;
    type: string;
  }> {
    return Array.from(this.relationships.entries()).map(([name, rel]) => ({
      name,
      ...rel
    }));
  }

  // Remove a relationship
  removeRelationship(name: string): void {
    this.relationships.delete(name);
  }

  // Clear all stored parent values
  clearParentValues(): void {
    this.parentValues.clear();
  }
}

// Singleton instances
export const sequenceManager = new SequenceManager();
export const formatManager = new FormatManager();
export const relationshipManager = new RelationshipManager();

// Utility functions for advanced data generation
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

export const generateTimestamp = (): string => {
  return new Date().toISOString();
};

export const generateAutoIncrementId = (sequenceName: string, startValue: number = 1): string => {
  return sequenceManager.getNextValue(sequenceName, { startValue });
};

export const generateCustomSequence = (
  sequenceName: string,
  pattern?: string,
  prefix?: string,
  suffix?: string
): string => {
  return sequenceManager.getNextValue(sequenceName, {
    startValue: 1,
    increment: 1,
    pattern,
    prefix,
    suffix
  });
};

export const generateCustomFormat = (formatName: string): string => {
  return formatManager.generateValue(formatName);
};

export const generateForeignKey = (relationshipName: string): any => {
  return relationshipManager.generateForeignKey(relationshipName);
};

// Reset all managers
export const resetAllManagers = (): void => {
  sequenceManager.resetAll();
  relationshipManager.clearParentValues();
};
