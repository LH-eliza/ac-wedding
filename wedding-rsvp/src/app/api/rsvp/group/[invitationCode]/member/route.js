import { connectToDatabase } from '../../../../../lib/mongoose';
import Individual from '../../../../../../../models/Individual';

export async function POST(request, { params }) {
    try {
        await connectToDatabase();
        
        const { invitationCode } = await params;
        const { firstName, lastName, email } = await request.json();

        // Validate required fields
        if (!firstName || !lastName) {
            return Response.json(
                { message: 'First name and last name are required' },
                { status: 400 }
            );
        }

        // Get the group name from existing members (this also verifies the invitation code exists)
        const existingMember = await Individual.findOne({ invitationCode });
        if (!existingMember) {
            return Response.json(
                { message: 'No existing group found for this invitation code' },
                { status: 404 }
            );
        }

        // Create new individual with the same group information
        const newIndividual = new Individual({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email?.trim() || null,
            invitationCode,
            groupName: existingMember.groupName,
            rsvpStatus: 'Pending',
            dietaryRestrictions: [],
            comments: ''
        });

        await newIndividual.save();

        return Response.json(
            { 
                message: 'Member added successfully',
                individual: newIndividual 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding member to group:', error);
        return Response.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
