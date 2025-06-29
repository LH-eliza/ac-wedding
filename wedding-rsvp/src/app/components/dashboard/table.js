'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Modal from 'react-modal';

// Set the app element for accessibility
if (typeof window !== 'undefined') {
    Modal.setAppElement('body');
}

const RSVPTable = forwardRef((props, ref) => {
    const [individuals, setIndividuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [editingIndividual, setEditingIndividual] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedGroupCode, setSelectedGroupCode] = useState(null);
    const [addMemberForm, setAddMemberForm] = useState({
        firstName: '',
        lastName: ''
    });
    
    // Add New Group modal state
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupMembers, setGroupMembers] = useState([{ firstName: "", lastName: "" }]);

    useEffect(() => {
        fetchIndividuals();
    }, []);

    // Auto-fill last names when group name changes
    useEffect(() => {
        if (groupName.trim()) {
            setGroupMembers(prevMembers => 
                prevMembers.map(member => ({
                    ...member,
                    lastName: member.lastName === "" || prevMembers.some(m => m.lastName === member.lastName) 
                        ? groupName.trim() 
                        : member.lastName
                }))
            );
        }
    }, [groupName]);

    // Expose refresh function to parent component
    useImperativeHandle(ref, () => ({
        refresh: fetchIndividuals
    }));

    const fetchIndividuals = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/rsvp');
            
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const data = await response.json();
            setIndividuals(data.individuals || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRsvpStatusColor = (status) => {
        switch (status) {
            case 'Accepted':
                return 'bg-green-100 text-green-800';
            case 'Declined':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'No Response':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate dietary restriction statistics
    const getDietaryStats = () => {
        const dietaryCounts = {};
        const allDietaryOptions = ['Dairy-free', 'Diabetic', 'Egg-free', 'Gluten-free', 'Halal', 'Keto', 'Kosher', 'Lactose intolerant', 'No spicy food', 'Nut-free', 'Shellfish-free', 'Soy-free', 'Vegan', 'Vegetarian'];
        
        // Initialize counts
        allDietaryOptions.forEach(diet => {
            dietaryCounts[diet] = 0;
        });
        
        // Count dietary restrictions for individuals who have accepted
        individuals.forEach(individual => {
            if (individual.rsvpStatus === 'Accepted') {
                // Handle different formats of dietary restrictions
                let dietaryRestrictions = individual.dietaryRestrictions;
                
                // If it's a string, convert to array
                if (typeof dietaryRestrictions === 'string') {
                    dietaryRestrictions = dietaryRestrictions.split(',').map(d => d.trim()).filter(d => d);
                }
                
                // If it's an array and has items
                if (Array.isArray(dietaryRestrictions) && dietaryRestrictions.length > 0) {
                    dietaryRestrictions.forEach(diet => {
                        const cleanDiet = typeof diet === 'string' ? diet.trim() : diet;
                        if (dietaryCounts.hasOwnProperty(cleanDiet)) {
                            dietaryCounts[cleanDiet]++;
                        }
                    });
                }
            }
        });
        
        // Return top dietary restrictions (only those with count > 0)
        return Object.entries(dietaryCounts)
            .filter(([diet, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Top 20
    };

    // Group individuals by invitation code
    const groupedInvitations = individuals.reduce((groups, individual) => {
        const code = individual.invitationCode;
        if (!groups[code]) {
            groups[code] = [];
        }
        groups[code].push(individual);
        return groups;
    }, {});

    // Filter groups based on search term
    const filteredGroupedInvitations = Object.entries(groupedInvitations).reduce((filtered, [code, members]) => {
        if (!searchTerm.trim()) {
            // If no search term, include all groups
            filtered[code] = members;
        } else {
            // Filter members that match the search term
            const matchingMembers = members.filter(member => 
                member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            // Include the group if it has matching members
            if (matchingMembers.length > 0) {
                filtered[code] = matchingMembers;
            }
        }
        return filtered;
    }, {});

    // Toggle expansion for a group
    const toggleGroup = (invitationCode) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(invitationCode)) {
            newExpanded.delete(invitationCode);
        } else {
            newExpanded.add(invitationCode);
        }
        setExpandedGroups(newExpanded);
    };

    // Get group summary info
    const getGroupSummary = (members) => {
        const totalMembers = members.length;
        const acceptedCount = members.filter(m => m.rsvpStatus === 'Accepted').length;
        const declinedCount = members.filter(m => m.rsvpStatus === 'Declined').length;
        const pendingCount = members.filter(m => m.rsvpStatus === 'Pending').length;
        
        return {
            totalMembers,
            acceptedCount,
            declinedCount,
            pendingCount,
            groupName: members[0]?.groupName || 'Unknown Group'
        };
    };

    // Helper function to highlight search terms
    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm.trim()) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? 
                <span key={index} className="bg-yellow-200 font-semibold">{part}</span> : 
                part
        );
    };

    // Start editing individual
    const startEdit = (individual) => {
        setEditingIndividual(individual._id);
        setEditForm({
            firstName: individual.firstName,
            lastName: individual.lastName,
            rsvpStatus: individual.rsvpStatus,
            dietaryRestrictions: individual.dietaryRestrictions || [],
            comments: individual.comments || ''
        });
    };

    // Save edited individual
    const saveEdit = async (individualId) => {
        try {
            const response = await fetch(`/api/rsvp/${individualId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });
            
            if (response.ok) {
                // Update the local state with the edited data
                setIndividuals(individuals.map(ind => 
                    ind._id === individualId ? { ...ind, ...editForm, updatedAt: new Date().toISOString() } : ind
                ));
                setEditingIndividual(null);
                setEditForm({});
            } else {
                alert('Failed to update individual');
            }
        } catch (error) {
            console.error('Error updating individual:', error);
            alert('Error updating individual');
        }
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingIndividual(null);
        setEditForm({});
    };

    // Delete individual
    const deleteIndividual = async (individualId, individualName) => {
        if (!confirm(`Are you sure you want to delete ${individualName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/rsvp/${individualId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                // Remove the individual from the local state
                setIndividuals(individuals.filter(ind => ind._id !== individualId));
            } else {
                const error = await response.json();
                alert(`Failed to delete individual: ${error.message}`);
            }
        } catch (error) {
            console.error('Error deleting individual:', error);
            alert('Error deleting individual');
        }
    };

    // Open add member modal
    const openAddMemberModal = (invitationCode) => {
        setSelectedGroupCode(invitationCode);
        setAddMemberForm({
            firstName: '',
            lastName: ''
        });
        setShowAddMemberModal(true);
    };

    // Close add member modal
    const closeAddMemberModal = () => {
        setShowAddMemberModal(false);
        setSelectedGroupCode(null);
        setAddMemberForm({
            firstName: '',
            lastName: ''
        });
    };

    // Add member to group
    const addMemberToGroup = async (e) => {
        e.preventDefault();
        
        if (!addMemberForm.firstName.trim() || !addMemberForm.lastName.trim()) {
            alert('Please enter both first and last name.');
            return;
        }

        try {
            const response = await fetch(`/api/rsvp/group/${selectedGroupCode}/member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addMemberForm),
            });
            
            if (response.ok) {
                const newMember = await response.json();
                // Add the new member to the local state
                setIndividuals([...individuals, newMember.individual]);
                closeAddMemberModal();
            } else {
                const error = await response.json();
                alert(`Failed to add member: ${error.message}`);
            }
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Error adding member');
        }
    };

    // Export data to CSV
    const exportToCSV = () => {
        // Define CSV headers
        const headers = [
            'Invitation Code',
            'Group Name', 
            'First Name',
            'Last Name',
            'RSVP Status',
            'Dietary Restrictions',
            'Comments',
            'Created At',
            'Last Updated'
        ];

        // Convert individuals data to CSV rows
        const csvData = individuals.map(individual => [
            individual.invitationCode || '',
            individual.groupName || '',
            individual.firstName || '',
            individual.lastName || '',
            individual.rsvpStatus || '',
            Array.isArray(individual.dietaryRestrictions) 
                ? individual.dietaryRestrictions.join('; ') 
                : (individual.dietaryRestrictions || ''),
            individual.comments || '',
            individual.createdAt ? new Date(individual.createdAt).toLocaleDateString() : '',
            individual.updatedAt ? new Date(individual.updatedAt).toLocaleDateString() : ''
        ]);

        // Combine headers and data
        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => 
                typeof field === 'string' && field.includes(',') 
                    ? `"${field.replace(/"/g, '""')}"` 
                    : field
            ).join(','))
            .join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `wedding-rsvp-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Add New Group functions
    const openAddGroupModal = () => {
        setGroupName("");
        setGroupMembers([{ firstName: "", lastName: "" }]);
        setShowAddGroupModal(true);
    };

    const closeAddGroupModal = () => {
        setShowAddGroupModal(false);
        setGroupName("");
        setGroupMembers([{ firstName: "", lastName: "" }]);
    };

    const handleAddGroupMember = () => {
        // If group name is populated, use it as the default last name for new members
        const defaultLastName = groupName.trim() ? groupName.trim() : "";
        setGroupMembers([...groupMembers, { firstName: "", lastName: defaultLastName }]);
    };

    const handleRemoveGroupMember = (idx) => {
        setGroupMembers(groupMembers.filter((_, i) => i !== idx));
    };

    const handleGroupMemberChange = (idx, field, value) => {
        setGroupMembers(
            groupMembers.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
        );
    };

    const handleAddInvitation = async (e) => {
        e.preventDefault();

        // Validate that each member has a first and last name
        if (
            groupName.trim() &&
            groupMembers.every((m) => m.firstName.trim() && m.lastName.trim())
        ) {
            // Generate the form data for each member
            const formData = groupMembers.map((member) => ({
                ...member,
                groupName,
            }));

            try {
                // Send data to the server
                const response = await fetch("/api/rsvp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ members: formData }),
                });

                const data = await response.json();

                if (data.message === "Invitation and members added successfully!") {
                    // Successfully added invitation, refresh the table
                    fetchIndividuals();
                    closeAddGroupModal();
                } else {
                    alert("Failed to add invitation");
                }
            } catch (error) {
                console.error("Error submitting invitation:", error);
                alert("There was an error submitting the invitation");
            }
        } else {
            alert("Please make sure all members have both first and last names.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading wedding RSVP data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-none">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Amy & Corey's Wedding RSVP Dashboard
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {Object.keys(filteredGroupedInvitations).length} invitation groups • {Object.values(filteredGroupedInvitations).flat().length} individuals
                                    {searchTerm && ` (filtered from ${Object.keys(groupedInvitations).length} groups)`}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Click on invitation codes to expand/collapse group details
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 items-end">
                                <button
                                    onClick={fetchIndividuals}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold shadow-md text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {loading ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md text-sm flex items-center gap-2"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export CSV
                                </button>
                                <button
                                    onClick={openAddGroupModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md text-sm"
                                >
                                    + Add New Group
                                </button>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by first name, last name, group name, or invitation code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-80 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="space-y-4">
                            {/* RSVP Statistics */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">RSVP Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['Accepted', 'Declined', 'Pending'].map((status) => {
                                        const count = individuals.filter(individual => individual.rsvpStatus === status).length;
                                        return (
                                            <div key={status} className="bg-white rounded-lg shadow p-4 text-center">
                                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                                <div className="text-sm text-gray-600">{status}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Dietary Restrictions Statistics */}
                            {(() => {
                                const dietaryStats = getDietaryStats();
                                
                                return dietaryStats.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions (Accepted Guests)</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {dietaryStats.map(([diet, count]) => (
                                                <div key={diet} className="bg-white rounded-full shadow px-3 py-1 text-center border">
                                                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                                                    <span className="text-xs text-gray-600 ml-1">{diet}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invitation Code / Group
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Members / Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        RSVP Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dietary Restrictions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(filteredGroupedInvitations).map(([invitationCode, members]) => {
                                    const summary = getGroupSummary(members);
                                    const isExpanded = expandedGroups.has(invitationCode);
                                    
                                    return (
                                        <React.Fragment key={invitationCode}>
                                            {/* Group Header Row */}
                                            <tr 
                                                className="bg-blue-50 hover:bg-blue-100 cursor-pointer border-l-4 border-blue-500"
                                                onClick={() => toggleGroup(invitationCode)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="mr-2 text-lg text-gray-700 font-bold">
                                                            {isExpanded ? '▼' : '▶'}
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-bold text-blue-900">
                                                                #{highlightSearchTerm(invitationCode, searchTerm)}
                                                            </div>
                                                            <div className="text-xs text-blue-700">
                                                                Click to {isExpanded ? 'collapse' : 'expand'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {highlightSearchTerm(summary.groupName, searchTerm)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {summary.totalMembers} member{summary.totalMembers !== 1 ? 's' : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {summary.acceptedCount > 0 && (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                {summary.acceptedCount} Accepted
                                                            </span>
                                                        )}
                                                        {summary.declinedCount > 0 && (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                                {summary.declinedCount} Declined
                                                            </span>
                                                        )}
                                                        {summary.pendingCount > 0 && (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                {summary.pendingCount} Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    -
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    -
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(Math.min(...members.map(m => new Date(m.createdAt))))}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(Math.max(...members.map(m => new Date(m.updatedAt))))}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAddMemberModal(invitationCode);
                                                        }}
                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                        title="Add new member to this group"
                                                    >
                                                        + Add Member
                                                    </button>
                                                </td>
                                            </tr>
                                            
                                            {/* Individual Member Rows (when expanded) */}
                                            {isExpanded && members.map((individual) => {
                                                const isEditing = editingIndividual === individual._id;
                                                
                                                return (
                                                    <tr key={individual._id} className="hover:bg-gray-50 bg-gray-25">
                                                        <td className="px-6 py-4 pl-12 whitespace-nowrap text-sm text-gray-500">
                                                            └ Member
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {isEditing ? (
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.firstName}
                                                                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                                                        className="w-24 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        placeholder="First"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.lastName}
                                                                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                                                        className="w-24 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        placeholder="Last"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span 
                                                                    onDoubleClick={() => startEdit(individual)}
                                                                    className="cursor-pointer hover:bg-yellow-100 px-1 rounded"
                                                                    title="Double-click to edit"
                                                                >
                                                                    {highlightSearchTerm(`${individual.firstName} ${individual.lastName}`, searchTerm)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                            {isEditing ? (
                                                                <select
                                                                    value={editForm.rsvpStatus}
                                                                    onChange={(e) => setEditForm({...editForm, rsvpStatus: e.target.value})}
                                                                    className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Accepted">Accepted</option>
                                                                    <option value="Declined">Declined</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRsvpStatusColor(individual.rsvpStatus)}`}>
                                                                    {individual.rsvpStatus}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {isEditing ? (
                                                                <select
                                                                    multiple
                                                                    value={editForm.dietaryRestrictions}
                                                                    onChange={(e) => setEditForm({...editForm, dietaryRestrictions: Array.from(e.target.selectedOptions, option => option.value)})}
                                                                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    size="5"
                                                                >
                                                                    <option value="Dairy-free">Dairy-free</option>
                                                                    <option value="Diabetic">Diabetic</option>
                                                                    <option value="Egg-free">Egg-free</option>
                                                                    <option value="Gluten-free">Gluten-free</option>
                                                                    <option value="Halal">Halal</option>
                                                                    <option value="Keto">Keto</option>
                                                                    <option value="Kosher">Kosher</option>
                                                                    <option value="Lactose intolerant">Lactose intolerant</option>
                                                                    <option value="No spicy food">No spicy food</option>
                                                                    <option value="Nut-free">Nut-free</option>
                                                                    <option value="Shellfish-free">Shellfish-free</option>
                                                                    <option value="Soy-free">Soy-free</option>
                                                                    <option value="Vegan">Vegan</option>
                                                                    <option value="Vegetarian">Vegetarian</option>
                                                                </select>
                                                            ) : (
                                                                individual.dietaryRestrictions && individual.dietaryRestrictions.length > 0 
                                                                    ? individual.dietaryRestrictions.join(', ')
                                                                    : 'None'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                            {isEditing ? (
                                                                <textarea
                                                                    value={editForm.comments}
                                                                    onChange={(e) => setEditForm({...editForm, comments: e.target.value})}
                                                                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    rows="2"
                                                                    placeholder="Comments"
                                                                />
                                                            ) : (
                                                                <div className="truncate">
                                                                    {individual.comments || 'N/A'}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(individual.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(individual.updatedAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {isEditing ? (
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => saveEdit(individual._id)}
                                                                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => startEdit(individual)}
                                                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        title="Edit member"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteIndividual(individual._id, `${individual.firstName} ${individual.lastName}`)}
                                                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                        title="Delete member"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {individuals.length === 0 && !searchTerm && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">
                                No RSVP responses found.
                            </div>
                        </div>
                    )}
                    
                    {Object.keys(filteredGroupedInvitations).length === 0 && searchTerm && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">
                                No results found for "{searchTerm}"
                            </div>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal using react-modal */}
            <Modal
                isOpen={showAddMemberModal}
                onRequestClose={closeAddMemberModal}
                contentLabel="Add New Member"
                className="modal-content"
                overlayClassName="modal-overlay"
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    },
                    content: {
                        position: 'relative',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '32px',
                        minWidth: '320px',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        outline: 'none',
                        inset: 'auto'
                    }
                }}
            >
                <div className="relative">
                    <button
                        onClick={closeAddMemberModal}
                        className="absolute -top-2 -right-2 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none transition-colors duration-200 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        Add New Member
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Adding to group: <span className="font-semibold">#{selectedGroupCode}</span>
                    </p>
                    <form onSubmit={addMemberToGroup}>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="First Name *"
                                    value={addMemberForm.firstName}
                                    onChange={(e) => setAddMemberForm({...addMemberForm, firstName: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-90"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Last Name *"
                                    value={addMemberForm.lastName}
                                    onChange={(e) => setAddMemberForm({...addMemberForm, lastName: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-90"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold shadow-lg"
                            >
                                Add Member
                            </button>
                            <button
                                type="button"
                                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition shadow-lg"
                                onClick={closeAddMemberModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Add New Group Modal using react-modal */}
            <Modal
                isOpen={showAddGroupModal}
                onRequestClose={closeAddGroupModal}
                contentLabel="Add New Group"
                className="modal-content"
                overlayClassName="modal-overlay"
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    },
                    content: {
                        position: 'relative',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '32px',
                        minWidth: '500px',
                        maxWidth: '600px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        outline: 'none',
                        inset: 'auto'
                    }
                }}
            >
                <div className="relative">
                    <button
                        onClick={closeAddGroupModal}
                        className="absolute -top-2 -right-2 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none transition-colors duration-200 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        Add New Group
                    </h2>
                    <form onSubmit={handleAddInvitation}>
                        <input
                            type="text"
                            placeholder="Group/Family Name *"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-90"
                            required
                        />
                        <div className="mb-4">
                            <div className="font-semibold mb-2 text-gray-800">Members</div>
                            {groupMembers.map((member, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={member.firstName}
                                        onChange={(e) =>
                                            handleGroupMemberChange(idx, "firstName", e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-90"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={member.lastName}
                                        onChange={(e) =>
                                            handleGroupMemberChange(idx, "lastName", e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-90"
                                        required
                                    />
                                    {groupMembers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGroupMember(idx)}
                                            className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 border border-red-200 hover:border-red-300 flex-shrink-0"
                                            aria-label="Remove member"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddGroupMember}
                                className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition shadow-sm"
                            >
                                + Add Another Member
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold shadow-lg"
                            >
                                Create Group
                            </button>
                            <button
                                type="button"
                                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition shadow-lg"
                                onClick={closeAddGroupModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
});

RSVPTable.displayName = 'RSVPTable';

export default RSVPTable;