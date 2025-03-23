import React, { useState, useEffect } from 'react';
import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import API_BASE_URL from "@/config/apiConfig";
import BUDDHA_YRARS from '@/utils/buddhaYears';
import { formatDayMonth } from "@/utils/dateUtils";
import { hasApprovePermission } from '@/utils/authUtils';

interface Period {
  period_id: string;
  year: number;
  semiannual: number;
  semiannual_id: number;
  periodName: string;
  startDate: string;
  endDate: string;
}

interface Table {
  tableName: string;
  schemaName: string;
  category: string;
}

export default function DataManagement() {
  // State for form data and UI
  const [periods, setPeriods] = useState<Period[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemiannual, setSelectedSemiannual] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [updateFields, setUpdateFields] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string; data?: any} | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Derived state for filtered periods
  const availableYears = [...new Set(periods.map(period => period.year))].sort((a, b) => b - a);
  const availableSemiannuals = selectedYear ? 
    [...new Set(periods.filter(period => period.year === selectedYear)
      .map(period => period.semiannual))].sort() : 
    [];
  const availablePeriods = (selectedYear && selectedSemiannual) ? 
    periods.filter(period => period.year === selectedYear && period.semiannual === selectedSemiannual) : 
    [];
  
  // Fetch periods and available tables on component mount
  useEffect(() => {
    fetchPeriods();
    fetchAvailableTables();
  }, []);

  // Fetch periods from API
  const fetchPeriods = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/upload/periods`,{
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch periods');
      }
      
      const data = await response.json();
      setPeriods(data.data || []);
    } catch (error) {
      setError('Failed to load periods. Please try again.');
      console.error('Error fetching periods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available tables from API
  const fetchAvailableTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/upload/available-tables`,{
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available tables');
      }
      
      const data = await response.json();
      setTables(data.data || []);
    } catch (error) {
      setError('Failed to load tables. Please try again.');
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete operation
  const handleDelete = async () => {
    if (!selectedPeriod || !selectedTable) {
      setError('กรุณาเลือกช่วงเวลาและตารางข้อมูล');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/upload/delete-data`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          periodId: selectedPeriod,
          targetTable: selectedTable
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete data');
      }

      setResult(data);
      // Reset form after successful operation
      setSelectedPeriod('');
      setSelectedTable('');
    } catch (error) {
      setError(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      console.error('Error deleting data:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmDelete(false);
    }
  };

  // Handle update operation
  const handleUpdate = async () => {
    if (!selectedPeriod || !selectedTable || Object.keys(updateFields).length === 0) {
      setError('กรุณาเลือกช่วงเวลา, ตารางข้อมูล และระบุข้อมูลที่ต้องการอัพเดท');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/upload/update-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          periodId: selectedPeriod,
          targetTable: selectedTable,
          updateFields: updateFields
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update data');
      }

      setResult(data);
      // Reset form after successful operation
      setSelectedPeriod('');
      setSelectedTable('');
      setUpdateFields({});
    } catch (error) {
      setError(error.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      console.error('Error updating data:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmUpdate(false);
    }
  };

  // Handle update field change
  const handleUpdateFieldChange = (fieldName: string, value: any) => {
    setUpdateFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Add a new update field
  const addUpdateField = () => {
    setUpdateFields(prev => ({
      ...prev,
      ['newField' + (Object.keys(prev).length + 1)]: ''
    }));
  };

  // Remove an update field
  const removeUpdateField = (fieldName: string) => {
    const newFields = {...updateFields};
    delete newFields[fieldName];
    setUpdateFields(newFields);
  };

  // Reset the form
  const resetForm = () => {
    setSelectedYear(null);
    setSelectedSemiannual(null);
    setSelectedPeriod('');
    setSelectedTable('');
    setUpdateFields({});
    setResult(null);
    setError(null);
  };
  
  // Handle year selection
  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    setSelectedSemiannual(null);
    setSelectedPeriod('');
  };
  
  // Handle semiannual selection
  const handleSemiannualChange = (semiannual: number | null) => {
    setSelectedSemiannual(semiannual);
    setSelectedPeriod('');
  };

  return (
    <Container>
      <SectionTitle title="จัดการข้อมูล" align="center" />
      
      <div className="p-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
          <h2 className="text-xl font-semibold mb-4">เลือกข้อมูลที่ต้องการจัดการ</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button 
                className="float-right font-bold"
                onClick={() => setError(null)}
              >
                &times;
              </button>
            </div>
          )}
          
          {result && result.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {result.message}
              <button 
                className="float-right font-bold"
                onClick={() => setResult(null)}
              >
                &times;
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Year Selection */}
            <div>
              <label className="block text-gray-700 mb-2">ปี</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedYear || ''}
                onChange={(e) => handleYearChange(e.target.value ? parseInt(e.target.value) : null)}
                disabled={loading}
              >
                <option value="">-- เลือกปี --</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year + BUDDHA_YRARS}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Semiannual Selection */}
            <div>
              <label className="block text-gray-700 mb-2">ช่วงที่มาเก็บข้อมูล</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedSemiannual || ''}
                onChange={(e) => handleSemiannualChange(e.target.value ? parseInt(e.target.value) : null)}
                disabled={loading || !selectedYear}
              >
                <option value="">-- เลือกช่วงที่มาเก็บข้อมูล --</option>
                {availableSemiannuals.map((semiannual) => (
                  <option key={semiannual} value={semiannual}>
                    {semiannual === 1 ? 'ม.ค. - มิ.ย.' : 'ก.ค. - ธ.ค.'}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Period Selection with Start/End Dates */}
            <div>
              <label className="block text-gray-700 mb-2">วันที่เก็บข้อมูล</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={loading || !selectedYear || !selectedSemiannual}
              >
                <option value="">-- เลือกวันที่เก็บข้อมูล --</option>
                {availablePeriods.map((period) => (
                  <option key={period.period_id} value={period.period_id}>
                    {formatDayMonth(period.startDate)} ถึง {formatDayMonth(period.endDate)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Table Selection */}
            <div>
              <label className="block text-gray-700 mb-2">ตารางข้อมูล</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                disabled={loading}
              >
                <option value="">-- เลือกตารางข้อมูล --</option>
                {tables.map((table) => (
                  <option key={table.tableName} value={table.tableName}>
                    {table.category}: {table.tableName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            {hasApprovePermission() && (
              <>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={!selectedPeriod || !selectedTable || loading || actionLoading}
                >
                  ลบข้อมูล
                </button>
                
                {/* <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                  onClick={() => setShowConfirmUpdate(true)}
                  disabled={!selectedPeriod || !selectedTable || Object.keys(updateFields).length === 0 || loading || actionLoading}
                >
                  อัพเดทข้อมูล
                </button> */}
              </>
            )}
            
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 ml-auto"
              onClick={resetForm}
              disabled={loading || actionLoading}
            >
              รีเซ็ต
            </button>
          </div>
        </div>
        
        {/* Update Fields Section */}
        {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">ข้อมูลที่ต้องการอัพเดท</h2>
            {hasApprovePermission() && (
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                onClick={addUpdateField}
                disabled={loading || actionLoading}
              >
                + เพิ่มฟิลด์
              </button>
            )}
          </div>
          
          {Object.keys(updateFields).length === 0 ? (
            <p className="text-gray-500 italic">ยังไม่มีฟิลด์ที่ต้องการอัพเดท กรุณาเพิ่มฟิลด์</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(updateFields).map(([fieldName, value]) => (
                <div key={fieldName} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="ชื่อฟิลด์"
                    value={fieldName}
                    onChange={(e) => {
                      const newFields = {...updateFields};
                      const oldValue = newFields[fieldName];
                      delete newFields[fieldName];
                      newFields[e.target.value] = oldValue;
                      setUpdateFields(newFields);
                    }}
                    disabled={loading || actionLoading}
                  />
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="ค่า"
                    value={value}
                    onChange={(e) => handleUpdateFieldChange(fieldName, e.target.value)}
                    disabled={loading || actionLoading}
                  />
                  <button
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    onClick={() => removeUpdateField(fieldName)}
                    disabled={loading || actionLoading}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">ยืนยันการลบข้อมูล</h3>
            <p className="mb-6">
              คุณต้องการลบข้อมูลจากตาราง <span className="font-semibold">{selectedTable}</span> ในช่วงเวลาที่เลือกใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowConfirmDelete(false)}
                disabled={actionLoading}
              >
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Update Confirmation Modal */}
      {showConfirmUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">ยืนยันการอัพเดทข้อมูล</h3>
            <p className="mb-6">
              คุณต้องการอัพเดทข้อมูลในตาราง <span className="font-semibold">{selectedTable}</span> ในช่วงเวลาที่เลือกใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowConfirmUpdate(false)}
                disabled={actionLoading}
              >
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={handleUpdate}
                disabled={actionLoading}
              >
                {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการอัพเดท'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}