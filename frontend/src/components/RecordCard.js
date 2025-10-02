import React from 'react';

/**
 * Component to display a medical record card
 */
const RecordCard = ({ record, isSelectable = false, isSelected = false, onSelect, isEmergency = false }) => {
  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'lab report':
        return 'var(--success-color)'; // Green
      case 'prescription':
        return 'var(--info-color)'; // Blue
      case 'imaging':
        return 'var(--primary-color)'; // Purple
      case 'discharge summary':
        return 'var(--warning-color)'; // Orange
      case 'vaccination':
        return 'var(--secondary-color)'; // Cyan
      default:
        return 'var(--text-light)'; // Grey
    }
  };

  return (
    <div 
      className={`record-card hover-card ${isSelectable ? 'cursor-pointer' : ''} ${isSelected ? 'selected' : ''} ${isEmergency ? 'emergency-record' : ''}`}
      onClick={isSelectable ? () => onSelect(record.id) : undefined}
      style={{
        borderLeftColor: isEmergency ? 'var(--danger-color)' : getTypeColor(record.type),
        borderWidth: isEmergency ? '2px' : '1px',
      }}
    >
      <div className="record-card-header">
        <h3 className="record-card-title">{record.title}</h3>
        {isSelectable && (
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={isSelected}
              onChange={() => onSelect(record.id)}
            />
            <span className="checkbox-checkmark"></span>
          </label>
        )}
      </div>
      
      <div className="flex items-center mb-2">
        <span 
          className="record-card-type"
          style={{ backgroundColor: getTypeColor(record.type) }}
        >
          {record.type}
        </span>
        <span className="record-card-date ml-2">
          {new Date(record.date).toLocaleDateString()}
        </span>
      </div>
      
      <div className="record-card-details">
        <p><strong>Hospital:</strong> {record.hospital}</p>
        <p><strong>Doctor:</strong> {record.doctor}</p>
      </div>
      
      {!isSelectable && (
        <div className="record-card-actions">
          <a 
            href={record.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`btn btn-sm ${isEmergency ? 'btn-danger' : 'btn-outline'}`}
          >
            {isEmergency ? 'View Emergency Document' : 'View Document'}
          </a>
        </div>
      )}
      
      {isEmergency && record.emergencyNotes && (
        <div className="emergency-notes mt-3 p-2" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)', borderRadius: 'var(--border-radius)' }}>
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--danger-color)' }}>
              <path d="M8 2h8l4 4v16H4V2h4z"></path>
              <path d="M12 14v4"></path>
              <path d="M12 10h.01"></path>
            </svg>
            <strong style={{ color: 'var(--danger-color)' }}>Emergency Notes:</strong>
          </div>
          <p style={{ marginLeft: '22px', fontSize: '0.9rem' }}>{record.emergencyNotes}</p>
        </div>
      )}
    </div>
  );
};

export default RecordCard;