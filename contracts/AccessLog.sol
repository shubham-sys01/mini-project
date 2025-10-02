// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessLog {
    // Structure to store access log data
    struct Log {
        string patientId;      // Patient's unique identifier (Aadhaar or UUID)
        string accessorId;     // Hospital or doctor's identifier
        string recordIds;      // Comma-separated list of record IDs
        uint256 timestamp;     // Timestamp when access occurred
        string action;         // Action type (SHARE_CREATED, SHARE_ACCESSED, SHARE_REVOKED)
    }
    
    // Mapping from patient ID to their access logs
    mapping(string => Log[]) private patientLogs;
    
    // Event emitted when a new access log is created
    event AccessLogged(
        string patientId,
        string accessorId,
        string recordIds,
        uint256 timestamp,
        string action
    );
    
    /**
     * @dev Log a new access event
     * @param _patientId Patient's unique identifier
     * @param _accessorId Hospital or doctor's identifier
     * @param _recordIds Comma-separated list of record IDs
     * @param _timestamp Timestamp when access occurred
     * @param _action Action type
     */
    function logAccess(
        string memory _patientId,
        string memory _accessorId,
        string memory _recordIds,
        uint256 _timestamp,
        string memory _action
    ) public {
        // Create new log entry
        Log memory newLog = Log({
            patientId: _patientId,
            accessorId: _accessorId,
            recordIds: _recordIds,
            timestamp: _timestamp,
            action: _action
        });
        
        // Add to patient's logs
        patientLogs[_patientId].push(newLog);
        
        // Emit event
        emit AccessLogged(
            _patientId,
            _accessorId,
            _recordIds,
            _timestamp,
            _action
        );
    }
    
    /**
     * @dev Get all access logs for a patient
     * @param _patientId Patient's unique identifier
     * @return Array of Log structures
     */
    function getAccessLogs(string memory _patientId) public view returns (Log[] memory) {
        return patientLogs[_patientId];
    }
    
    /**
     * @dev Get the count of access logs for a patient
     * @param _patientId Patient's unique identifier
     * @return Number of logs
     */
    function getAccessLogCount(string memory _patientId) public view returns (uint256) {
        return patientLogs[_patientId].length;
    }
    
    /**
     * @dev Get a specific access log for a patient
     * @param _patientId Patient's unique identifier
     * @param _index Index of the log to retrieve
     * @return Log structure
     */
    function getAccessLogAt(string memory _patientId, uint256 _index) public view returns (Log memory) {
        require(_index < patientLogs[_patientId].length, "Index out of bounds");
        return patientLogs[_patientId][_index];
    }
}