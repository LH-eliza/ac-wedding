import Individual from '../../../../models/Individual';  // Import the Individual model
import { connectToDatabase } from '../../lib/mongoose'  // Import the database connection utility

// Function to generate random invitation code
function generateInvitationCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let invitationCode = '';
    for (let i = 0; i < 5; i++) {
        invitationCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return invitationCode;
}

// Helper function to check if the invitation code already exists in the database
async function checkInvitationCodeExists(code) {
    const existingRecord = await Individual.findOne({ invitationCode: code });
    return existingRecord !== null;
}

// API route for submitting RSVP data
export async function POST(req) {
    // Connect to the database
    await connectToDatabase();

    const { members } = await req.json();  // Destructure the members array from the request body

    try {
        // Generate a unique invitation code
        let invitationCode;
        do {
            invitationCode = generateInvitationCode();
        } while (await checkInvitationCodeExists(invitationCode));  // Check if the generated code exists

        // Loop through each member and save them to the database
        for (const member of members) {
            const formData = {
                invitationCode,  // Use the generated unique invitation code
                firstName: member.firstName.trim(),
                lastName: member.lastName.trim(),
                groupName: member.groupName,
                email: member.email ? member.email.trim() : '',
                rsvpStatus: 'Pending',  // Default RSVP status
                dietaryRestrictions: member.dietaryRestrictions || [],  // Dietary restrictions (optional)
                comments: member.comments || '',  // Optional comments
            };

            // Create a new individual record for each member
            const newIndividual = new Individual(formData);

            // Save the individual to the database
            await newIndividual.save();
        }

        // Return a success response
        return new Response(
            JSON.stringify({ message: 'Invitation and members added successfully!' }),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding invitation:', error);
        return new Response(
            JSON.stringify({ message: 'Failed to add invitation', error: error.message }),
            { status: 500 }
        );
    }
}

// API route for fetching all RSVP data
export async function GET(req) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Fetch all individuals from the database
        const individuals = await Individual.find({}).sort({ createdAt: -1 });

        // Return the individuals data
        return new Response(
            JSON.stringify({ individuals }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching individuals:', error);
        return new Response(
            JSON.stringify({ message: 'Failed to fetch individuals', error: error.message }),
            { status: 500 }
        );
    }
}
