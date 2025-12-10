import React, { useState } from 'react';
import { X, Download, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';

const ImportModal = ({ isOpen, onClose, type = 'borrowers' }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const typeConfig = {
    borrowers: {
      title: 'Import Borrowers',
      templateUrl: '/api/import/template/borrowers',
      uploadUrl: '/api/import/borrowers/upload',
      confirmUrl: '/api/import/borrowers/confirm'
    },
    leads: {
      title: 'Import Leads',
      templateUrl: '/api/import/template/leads',
      uploadUrl: '/api/import/leads/upload',
      confirmUrl: '/api/import/leads/confirm'
    },
    payments: {
      title: 'Import Payments',
      templateUrl: '/api/import/template/payments',
      uploadUrl: '/api/import/payments/upload',
      confirmUrl: '/api/import/payments/confirm'
    }
  };

  const config = typeConfig[type];

  const downloadTemplate = async () => {
    try {
      const response = await api.get(config.templateUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download template');
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post(config.uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPreview(response.data);
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = async () => {
    setImporting(true);
    try {
      const response = await api.post(config.confirmUrl, {
        validRows: preview.preview
      }, { responseType: 'blob' });

      // Download import report
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_import_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStep(4);
    } catch (error) {
      alert('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setPreview(null);
    setLoading(false);
    setImporting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{config.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Download Template */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Step 1: Download Template</h3>
                <p className="text-gray-600 mb-6">
                  Download the Excel template with the correct format and sample data
                </p>
                <button
                  onClick={downloadTemplate}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center mx-auto"
                >
                  <Download size={20} className="mr-2" />
                  Download Template
                </button>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Skip to upload →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Upload File */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Step 2: Upload Excel File</h3>
                <p className="text-gray-600 mb-6">
                  Select your filled Excel file to validate and preview data
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-gray-600">Click to select Excel file</span>
                    <span className="text-sm text-gray-400 mt-1">
                      Supports .xlsx and .xls files
                    </span>
                  </label>
                </div>
                {loading && (
                  <div className="mt-4 text-blue-500">
                    Processing file...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Preview & Validation */}
          {step === 3 && preview && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Step 3: Validation Results</h3>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{preview.totalRows}</div>
                  <div className="text-sm text-blue-600">Total Rows</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{preview.validCount}</div>
                  <div className="text-sm text-green-600">Valid Rows</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{preview.errorCount}</div>
                  <div className="text-sm text-red-600">Invalid Rows</div>
                </div>
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    Validation Errors
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {preview.errors.slice(0, 10).map((error, idx) => (
                      <div key={idx} className="text-sm text-red-700 mb-1">
                        Row {error.row}: {Object.entries(error.errors).map(([field, msg]) => 
                          `${field}: ${msg}`
                        ).join(', ')}
                      </div>
                    ))}
                    {preview.errors.length > 10 && (
                      <div className="text-sm text-red-600 mt-2">
                        ... and {preview.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {preview.preview.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Preview (First 5 valid rows)</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(preview.preview[0]).map(key => (
                            <th key={key} className="text-left p-2 font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.preview.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="border-b">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="p-2">
                                {value?.toString() || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
                {preview.validCount > 0 && (
                  <button
                    onClick={confirmImport}
                    disabled={importing}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : `Import ${preview.validCount} Records`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <CheckCircle size={64} className="mx-auto text-green-500" />
              <h3 className="text-xl font-medium text-green-600">Import Completed!</h3>
              <p className="text-gray-600">
                Your data has been successfully imported. The import report has been downloaded.
              </p>
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;