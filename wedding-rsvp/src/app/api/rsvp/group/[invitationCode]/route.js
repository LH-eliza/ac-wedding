import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongoose';
import Individual from '../../../../../../models/Individual';

// GET - Fetch group by invitation code
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { invitationCode } = params;
    
    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    // Find all individuals with this invitation code
    const individuals = await Individual.find({ invitationCode });
    
    if (!individuals || individuals.length === 0) {
      return NextResponse.json(
        { error: 'No group found with this invitation code' },
        { status: 404 }
      );
    }

    // Group the data
    const groupData = {
      invitationCode,
      groupName: individuals[0].groupName,
      members: individuals.map(individual => ({
        _id: individual._id,
        firstName: individual.firstName,
        lastName: individual.lastName,
        email: individual.email,
        rsvpStatus: individual.rsvpStatus,
        dietaryRestrictions: individual.dietaryRestrictions,
        comments: individual.comments,
        createdAt: individual.createdAt,
        updatedAt: individual.updatedAt
      }))
    };

    return NextResponse.json(groupData);
    
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update group information
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const { invitationCode } = params;
    const updates = await request.json();
    
    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    // Update all individuals in the group
    const result = await Individual.updateMany(
      { invitationCode },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No group found with this invitation code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Group updated successfully',
      modifiedCount: result.modifiedCount 
    });
    
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete entire group
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { invitationCode } = params;
    
    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    // Delete all individuals in the group
    const result = await Individual.deleteMany({ invitationCode });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'No group found with this invitation code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Group deleted successfully',
      deletedCount: result.deletedCount 
    });
    
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
