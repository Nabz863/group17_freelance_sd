import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from './FileUpload';

// Mock the file object correctly
const createMockFile = (name, size, type) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', {
    get() { return size; }
  });
  return file;
};

// Create a range of test files with different sizes
const mockFiles = {
  small: createMockFile('document.txt', 500, 'text/plain'),
  medium: createMockFile('document.pdf', 1024 * 5, 'application/pdf'),
  large: createMockFile('image.jpg', 1024 * 1024 * 2, 'image/jpeg'),
  xlarge: createMockFile('video.mp4', 1024 * 1024 * 1024 * 3, 'video/mp4')
};

describe('FileUpload component', () => {
  // Mock props
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Upload Files',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering tests
  it('renders correctly with default props', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('or click to select files')).toBeInTheDocument();
  });

  it('renders with optional file type label', () => {
    render(<FileUpload {...defaultProps} fileTypeLabel="PDF Only" fileType="pdf" />);
    
    expect(screen.getByText('PDF Only')).toBeInTheDocument();
    expect(screen.getByText('PDF Only')).toHaveClass('file-type-optional');
  });

  it('renders with required file type label', () => {
    render(<FileUpload {...defaultProps} fileTypeLabel="PDF Files" fileType="pdf" required={true} />);
    
    expect(screen.getByText('PDF Files')).toBeInTheDocument();
    expect(screen.getByText('PDF Files')).toHaveClass('file-type-required');
  });

  // File selection tests
  it('handles file selection via input', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [mockFiles.medium] } });
    
    expect(mockOnChange).toHaveBeenCalledWith([mockFiles.medium]);
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('5 KB')).toBeInTheDocument();
  });

  it('handles multiple file selection', async () => {
    render(<FileUpload {...defaultProps} multiple={true} />);
    
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { 
      target: { 
        files: [mockFiles.small, mockFiles.medium, mockFiles.large] 
      } 
    });
    
    expect(mockOnChange).toHaveBeenCalledWith([mockFiles.small, mockFiles.medium, mockFiles.large]);
    expect(screen.getByText('document.txt')).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });

  // Drag and drop tests
  it('handles drag over state', () => {
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = document.querySelector('.file-upload-container');
    
    // Simulate drag over
    fireEvent.dragOver(dropZone, { preventDefault: jest.fn() });
    
    expect(dropZone).toHaveClass('border-accent');
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
  });

  it('handles drag leave state', () => {
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = document.querySelector('.file-upload-container');
    
    // First trigger drag over
    fireEvent.dragOver(dropZone, { preventDefault: jest.fn() });
    expect(dropZone).toHaveClass('border-accent');
    
    // Then trigger drag leave
    fireEvent.dragLeave(dropZone);
    
    expect(dropZone).not.toHaveClass('border-accent');
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
  });

  it('handles file drop correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = document.querySelector('.file-upload-container');
    
    // Simulate file drop
    fireEvent.drop(dropZone, {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: [mockFiles.medium, mockFiles.large]
      }
    });
    
    expect(mockOnChange).toHaveBeenCalledWith([mockFiles.medium, mockFiles.large]);
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });

  // File removal tests
  it('adds and removes files correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    // Add a file
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [mockFiles.medium] } });
    
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    
    // Remove the file
    const removeButton = document.querySelector('.attachment-action-btn');
    fireEvent.click(removeButton, { stopPropagation: jest.fn() });
    
    expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();
  });

  // Format bytes tests
  it('formats bytes correctly for different file sizes', () => {
    render(<FileUpload {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    
    // Test with small file (Bytes)
    fireEvent.change(input, { target: { files: [mockFiles.small] } });
    expect(screen.getByText('500 Bytes')).toBeInTheDocument();
    
    // Remove file and test with medium file (KB)
    const removeButton = document.querySelector('.attachment-action-btn');
    fireEvent.click(removeButton, { stopPropagation: jest.fn() });
    
    fireEvent.change(input, { target: { files: [mockFiles.medium] } });
    expect(screen.getByText('5 KB')).toBeInTheDocument();
    
    // Remove file and test with large file (MB)
    const removeButton2 = document.querySelector('.attachment-action-btn');
    fireEvent.click(removeButton2, { stopPropagation: jest.fn() });
    
    fireEvent.change(input, { target: { files: [mockFiles.large] } });
    expect(screen.getByText('2 MB')).toBeInTheDocument();
    
    // Remove file and test with extra large file (GB)
    const removeButton3 = document.querySelector('.attachment-action-btn');
    fireEvent.click(removeButton3, { stopPropagation: jest.fn() });
    
    fireEvent.change(input, { target: { files: [mockFiles.xlarge] } });
    expect(screen.getByText('3 GB')).toBeInTheDocument();
  });

  // File dialog tests
  it('opens file dialog when clicked', () => {
    render(<FileUpload {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    const clickSpy = jest.spyOn(input, 'click');
    
    const dropZone = document.querySelector('.file-upload-container');
    fireEvent.click(dropZone);
    
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  // Test required attribute
  it('sets required attribute on input when required prop is true', () => {
    render(<FileUpload {...defaultProps} required={true} />);
    
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('required');
  });

  // Test accept attribute
  it('sets accept attribute on input when accept prop is provided', () => {
    render(<FileUpload {...defaultProps} accept=".pdf,.doc" />);
    
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', '.pdf,.doc');
  });

  // Test file type data attribute
  it('sets data-file-type attribute when fileType prop is provided', () => {
    render(<FileUpload {...defaultProps} fileType="document" />);
    
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('data-file-type', 'document');
  });

  // Test adding multiple batches of files
  it('correctly accumulates files when added in multiple batches', () => {
    render(<FileUpload {...defaultProps} multiple={true} />);
    
    const input = document.querySelector('input[type="file"]');
    
    // Add first batch
    fireEvent.change(input, { target: { files: [mockFiles.small] } });
    expect(screen.getByText('document.txt')).toBeInTheDocument();
    
    // Add second batch
    fireEvent.change(input, { target: { files: [mockFiles.medium] } });
    
    // Both files should be present
    expect(screen.getByText('document.txt')).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });
});