// src/app/rsvp/page.js
"use client"
import { useState } from 'react';

export default function Rsvp() {
  const [step, setStep] = useState(1);
  const [invitationCode, setInvitationCode] = useState(['', '', '', '', '']);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberResponses, setMemberResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Handle invitation code input
  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...invitationCode];
      newCode[index] = value.toUpperCase();
      setInvitationCode(newCode);
      
      // Check if this completes the code (all 5 characters filled)
      const isComplete = newCode.every(char => char !== '') && newCode.join('').length === 5;
      
      if (isComplete) {
        // Auto-submit when code is complete, using the complete newCode
        setTimeout(() => {
          handleCodeSubmitWithCode(newCode.join(''));
        }, 300); // Small delay for better UX
      } else if (value && index < 4) {
        // Auto-focus next input if not complete
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace to go to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !invitationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Submit invitation code with provided code string
  const handleCodeSubmitWithCode = async (code) => {
    console.log('Submitting code:', code);
    if (code.length === 5) {
      setLoading(true);
      try {
        const response = await fetch(`/api/rsvp/group/${code}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Group data found:', data);
          setGroupData(data);
          
          // Auto-fill member responses from existing data
          const initialResponses = {};
          data.members.forEach(member => {
            initialResponses[member._id] = {
              attending: member.rsvpStatus === 'Accepted' ? true : 
                        member.rsvpStatus === 'Declined' ? false : undefined,
              dietaryRestrictions: member.dietaryRestrictions || [],
              comments: member.comments || ''
            };
          });
          setMemberResponses(initialResponses);
          
          setStep(2);
        } else {
          alert('Invalid invitation code. Please check and try again.');
        }
      } catch (error) {
        alert('Error finding invitation. Please try again.');
      }
      setLoading(false);
    } else {
      alert('Please enter a complete 5-character invitation code.');
    }
  };

  // Submit invitation code
  const handleCodeSubmit = async () => {
    const code = invitationCode.join('');
    await handleCodeSubmitWithCode(code);
  };

  // Handle member RSVP response
  const handleMemberResponse = (memberId, attending) => {
    setMemberResponses(prev => ({
      ...prev,
      [memberId]: {
        attending,
        dietaryRestrictions: prev[memberId]?.dietaryRestrictions || [],
        comments: prev[memberId]?.comments || ''
      }
    }));
  };

  // Handle dietary restrictions change
  const handleDietaryChange = (memberId, dietaryRestrictions) => {
    setMemberResponses(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        dietaryRestrictions
      }
    }));
  };

  // Handle comments change
  const handleCommentsChange = (memberId, comments) => {
    setMemberResponses(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        comments
      }
    }));
  };

  // Submit RSVP responses
  const handleSubmitRSVP = async () => {
    setSubmitting(true);
    try {
      // Update each member's RSVP
      for (const member of groupData.members) {
        const response = memberResponses[member._id];
        if (response) {
          const updateData = {
            rsvpStatus: response.attending ? 'Accepted' : 'Declined',
            dietaryRestrictions: response.attending ? response.dietaryRestrictions : [],
            comments: response.comments || ''
          };

          await fetch(`/api/rsvp/${member._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          });
        }
      }
      setStep(3);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Error submitting RSVP. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4" style={{ backgroundColor: '#FFFDF0' }}>
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            {[
              { label: 'Invitation Code', step: 1 },
              { label: 'Group Information', step: 2 },
              { label: 'Confirmation', step: 3 }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`px-6 py-2 sm:px-8 sm:py-3 rounded-md text-xs sm:text-sm transition-colors ${
                  step >= item.step 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`} style={{ backgroundColor: step >= item.step ? '#317039' : undefined }}>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">
                    {item.step === 1 ? 'Code' : item.step === 2 ? 'Info' : 'Done'}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2`} style={{ 
                    backgroundColor: step > item.step ? '#317039' : '#e5e7eb' 
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Invitation Code */}
        {step === 1 && (
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center">
            <div className="mb-6 sm:mb-8">
              <p className="text-base sm:text-lg mb-3 sm:mb-4 font-light" style={{ color: '#317039' }}>Let us know who you are!</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{ color: '#317039' }}>Enter Invitation Code</h1>
            </div>

            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-bold mr-3 sm:mr-4" style={{ color: '#317039' }}>#</span>
                <div className="flex space-x-2 sm:space-x-3">
                  {invitationCode.map((char, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={char}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-12 sm:w-18 sm:h-16 text-center text-lg sm:text-2xl font-semibold border border-gray-300 rounded-lg focus:outline-none transition-colors"
                      style={{ 
                        borderColor: char ? '#317039' : undefined,
                        color: '#317039',
                        '--tw-ring-color': '#317039'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#317039'}
                      onBlur={(e) => e.target.style.borderColor = char ? '#317039' : '#d1d5db'}
                      maxLength="1"
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCodeSubmit}
              disabled={loading || invitationCode.join('').length < 5}
              className="w-full sm:w-auto text-white px-6 sm:px-8 py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4 sm:mb-6"
              style={{ 
                backgroundColor: loading || invitationCode.join('').length < 5 ? undefined : '#317039'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = '#2c5f33';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = '#317039';
                }
              }}
            >
              {loading ? 'Finding your invitation...' : 'Continue'}
            </button>

            <div className="text-center">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Can&apos;t find your code?
              </a>
            </div>
          </div>
        )}

        {/* Step 2: Group Information */}
        {step === 2 && groupData && (
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-base sm:text-lg mb-3 sm:mb-4 font-light" style={{ color: '#317039' }}>
                Hey, let&apos;s RSVP
              </p>
              <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8" style={{ color: '#317039' }}>
                Enter your group details
              </h2>
            </div>

            <div className="space-y-6">
              {groupData.members.map((member, index) => {
                const response = memberResponses[member._id];
                const isAttending = response?.attending;
                
                return (
                  <div key={member._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">
                        {member.firstName} {member.lastName}
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleMemberResponse(member._id, true)}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            isAttending === true 
                              ? 'text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          style={{ 
                            backgroundColor: isAttending === true ? '#317039' : undefined 
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleMemberResponse(member._id, false)}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            isAttending === false 
                              ? 'bg-gray-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Animated dropdown for dietary restrictions and comments */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isAttending === true ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="mt-4 space-y-4">
                        {/* Dietary Restrictions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dietary Restrictions/Allergies
                          </label>
                          
                          {/* Selected items display */}
                          {response?.dietaryRestrictions?.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {response.dietaryRestrictions.map((restriction) => (
                                <span
                                  key={restriction}
                                  className="px-2 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: '#317039' }}
                                >
                                  {restriction}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <select
                            multiple
                            value={response?.dietaryRestrictions || []}
                            onChange={(e) => handleDietaryChange(
                              member._id, 
                              Array.from(e.target.selectedOptions, option => option.value)
                            )}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors text-sm"
                            style={{ 
                              borderColor: response?.dietaryRestrictions?.length > 0 ? '#317039' : undefined,
                              minHeight: '80px',
                              color: '#1f2937',
                              backgroundColor: 'transparent'
                            }}
                          >
                            {['Dairy-free', 'Diabetic', 'Egg-free', 'Gluten-free', 'Halal', 'Keto', 'Kosher', 'Lactose intolerant', 'No spicy food', 'Nut-free', 'Shellfish-free', 'Soy-free', 'Vegan', 'Vegetarian'].map((option) => {
                              const isSelected = response?.dietaryRestrictions?.includes(option);
                              return (
                                <option 
                                  key={option}
                                  value={option} 
                                  style={{ 
                                    backgroundColor: isSelected ? '#e8f5e8' : 'transparent', 
                                    color: isSelected ? '#317039' : '#1f2937',
                                    fontWeight: isSelected ? 'bold' : 'normal'
                                  }}
                                >
                                  {isSelected ? '✓ ' : ''}{option}
                                </option>
                              );
                            })}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Do we need to know anything else?
                          </label>
                          <textarea
                            value={response?.comments || ''}
                            onChange={(e) => handleCommentsChange(member._id, e.target.value)}
                            placeholder="Any additional comments or special requirements..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors text-sm resize-none"
                            style={{ 
                              borderColor: response?.comments ? '#317039' : undefined 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center mt-8 pt-6 border-t border-gray-200">
              {/* Validation message */}
              {groupData.members.some(member => memberResponses[member._id]?.attending === undefined) && (
                <p className="text-red-600 text-sm mb-4 text-center font-medium">
                  Please select Yes or No for all members before confirming your RSVP
                </p>
              )}
              
              <button
                onClick={handleSubmitRSVP}
                disabled={submitting || Object.keys(memberResponses).length === 0 || groupData.members.some(member => memberResponses[member._id]?.attending === undefined)}
                className="px-8 py-3 text-white rounded-lg font-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: submitting || Object.keys(memberResponses).length === 0 || groupData.members.some(member => memberResponses[member._id]?.attending === undefined) ? undefined : '#317039'
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm RSVP'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation (Placeholder) */}
        {step === 3 && (
          <div className="rounded-xl sm:rounded-2xl  p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-base sm:text-lg mb-3 sm:mb-4 font-light" style={{ color: '#317039' }}>
                See you soon!
              </p>
              <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8" style={{ color: '#317039' }}>
                You&apos;re All Good!
              </h2>
            </div>
                {/* Wedding Confirmation SVG */}
                <div
                  className="flex justify-center mb-6 sm:mb-8"
                  style={{ 
                    position: 'relative',
                    left: '50%',
                    right: '50%',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                    width: '100vw'
                  }}
                >
                  <div 
                    onClick={() => window.open('https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=8101+Bleeks+Rd,+Ottawa,+ON+K0A+1B0', '_blank')}
                    style={{ 
                      width: '80%', 
                      maxWidth: '800px',
                      cursor: 'pointer'
                    }}
                    className="h-auto"
                    title="Click to get directions to the venue"
                  >
                    <object 
                      data="/imgs/Good.svg" 
                      type="image/svg+xml"
                      style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
                      aria-label="Wedding Confirmation"
                    >
                      <img 
                        src="/imgs/Good.svg" 
                        alt="Wedding Confirmation" 
                        className="h-auto"
                        style={{ width: '100%', maxWidth: '800px' }}
                      />
                    </object>
                  </div>
                </div>
          </div>
        )}

      </div>
    </div>
  );
}
