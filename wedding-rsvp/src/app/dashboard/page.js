"use client";
import React, { useState, useRef } from "react";
import RSVPTable from "../components/dashboard/table";

const PASSWORD = "hello123";

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const rsvpTableRef = useRef(null);

  // Example data
  const [invited, setInvited] = useState(50);
  const [rsvp, setRsvp] = useState(20);

  const [newInviteName, setNewInviteName] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([{ firstName: "", lastName: "" }]);

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto mt-40 text-center bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Dashboard Login
        </h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  const handleAddMember = () => {
    setMembers([...members, { firstName: "", lastName: "" }]);
  };

  const handleRemoveMember = (idx) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, field, value) => {
    setMembers(
      members.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const handleAddInvitation = async (e) => {
    e.preventDefault();

    // Validate that each member has a first and last name
    if (
      groupName.trim() &&
      members.every((m) => m.firstName.trim() && m.lastName.trim())
    ) {
      // Generate the form data for each member (including the invitation code)
      const formData = members.map((member) => ({
        ...member,
        groupName, // Add the group name (this is optional depending on how you want to use it)
      }));

      try {
        // Send data to the server
        const response = await fetch("/api/rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ members: formData }), // Send the members data to backend
        });

        const data = await response.json();

        if (data.message === "Invitation and members added successfully!") {
          // Successfully added invitation, update the UI
          setInvited(invited + 1); // Increment the invited count
          setGroupName(""); // Reset the group name input
          setMembers([{ firstName: "", lastName: "" }]); // Clear the member list
          setShowModal(false); // Close the modal
          
          // Refresh the RSVP table to show the new group
          if (rsvpTableRef.current) {
            rsvpTableRef.current.refresh();
          }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-10 text-center">
            Amy & Corey's Wedding Dashboard
          </h1>
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 text-lg rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
            >
              Add New Group
            </button>
          </div>
        </div>
      </div>
      
      {/* RSVP Table Component - Full Width */}
      <div className="w-full">
        <RSVPTable ref={rsvpTableRef} />
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Add New Group
          </h2>
          <form onSubmit={handleAddInvitation}>
            <input
              type="text"
              placeholder="Group/Family Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="mb-4">
              <div className="font-semibold mb-2 text-gray-800">Members</div>
              {members.map((member, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={member.firstName}
                    onChange={(e) =>
                      handleMemberChange(idx, "firstName", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={member.lastName}
                    onChange={(e) =>
                      handleMemberChange(idx, "lastName", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="px-2 text-red-500 hover:text-red-700"
                      aria-label="Remove member"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMember}
                className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
                + Add Another Member
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Add Group
              </button>
              <button
                type="button"
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Widget({ label, value, color }) {
  return (
    <div
      className={`rounded-xl shadow-md p-8 min-w-[120px] text-center ${color}`}
    >
      <div className="text-4xl font-extrabold text-gray-800">{value}</div>
      <div className="text-lg text-gray-600 mt-2">{label}</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[320px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
