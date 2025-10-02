import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecords, getRecordsByCategory } from '../utils/api';
import RecordCard from '../components/RecordCard';

const RecordsList = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getAllRecords();
        
        if (response.success) {
          setRecords(response.data);
          setFilteredRecords(response.data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(response.data.map(record => record.type))];
          setCategories(uniqueCategories);
        } else {
          setError(response.message || 'Failed to fetch records');
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...records];
    
    // Apply category filter
    if (filter !== 'all') {
      result = result.filter(record => record.type === filter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(record => 
        record.title.toLowerCase().includes(term) ||
        record.hospital.toLowerCase().includes(term) ||
        record.doctor.toLowerCase().includes(term) ||
        record.type.toLowerCase().includes(term)
      );
    }
    
    setFilteredRecords(result);
  }, [filter, searchTerm, records]);

  const handleFilterChange = async (category) => {
    setFilter(category);
  };

  if (loading) {
    return (
      <div className="text-center p-3">
        <p>Loading your health records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
        <button 
          className="btn mt-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-3">
        <h2 style={{ marginBottom: '1rem' }}>Your Medical Records</h2>
        <p>
          View and manage all your medical records securely stored in DigiLocker.
        </p>
        
        <div className="flex justify-between items-center mt-3">
          <div>
            <Link to="/share" className="btn">
              Share Records
            </Link>
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ width: '250px' }}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-3 flex" style={{ overflowX: 'auto', padding: '0.5rem 0' }}>
        <button
          className={`btn ${filter === 'all' ? '' : 'btn-outline'}`}
          onClick={() => handleFilterChange('all')}
          style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}
        >
          All Records
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            className={`btn ${filter === category ? '' : 'btn-outline'}`}
            onClick={() => handleFilterChange(category)}
            style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}
          >
            {category}
          </button>
        ))}
      </div>
      
      {filteredRecords.length === 0 ? (
        <div className="card text-center p-3">
          <p>No records found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredRecords.map(record => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordsList;