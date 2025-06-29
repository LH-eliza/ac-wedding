'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

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

    useEffect(() => {
        fetchIndividuals();
    }, []);

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
                                    Wedding RSVP Dashboard
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {Object.keys(filteredGroupedInvitations).length} invitation groups • {Object.values(filteredGroupedInvitations).flat().length} individuals
                                    {searchTerm && ` (filtered from ${Object.keys(groupedInvitations).length} groups)`}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Click on invitation codes to expand/collapse group details
                                </p>
                            </div>
                            <div className="flex-shrink-0">
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
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isEditing ? (
                                                                <select
                                                                    value={editForm.rsvpStatus}
                                                                    onChange={(e) => setEditForm({...editForm, rsvpStatus: e.target.value})}
                                                                    className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Accepted">Accepted</option>
                                                                    <option value="Declined">Declined</option>
                                                                    <option value="No Response">No Response</option>
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
                                                                    size="3"
                                                                >
                                                                    <option value="Vegetarian">Vegetarian</option>
                                                                    <option value="Vegan">Vegan</option>
                                                                    <option value="Gluten-free">Gluten-free</option>
                                                                    <option value="Dairy-free">Dairy-free</option>
                                                                    <option value="Nut-free">Nut-free</option>
                                                                    <option value="Halal">Halal</option>
                                                                    <option value="Kosher">Kosher</option>
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

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Accepted', 'Declined', 'Pending', 'No Response'].map((status) => {
                        const count = individuals.filter(individual => individual.rsvpStatus === status).length;
                        return (
                            <div key={status} className="bg-white rounded-lg shadow p-6">
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                <div className="text-gray-600">{status}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] relative">
                        <button
                            onClick={closeAddMemberModal}
                            className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Last Name *"
                                        value={addMemberForm.lastName}
                                        onChange={(e) => setAddMemberForm({...addMemberForm, lastName: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
                                >
                                    Add Member
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    onClick={closeAddMemberModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
});

RSVPTable.displayName = 'RSVPTable';

export default RSVPTable;