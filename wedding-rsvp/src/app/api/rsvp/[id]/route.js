import Individual from '../../../../../models/Individual';
import { connectToDatabase } from '../../../lib/mongoose';

// Update individual
export async function PUT(req, { params }) {
    try {
        await connectToDatabase();
        
        const { id } = await params;
        const updateData = await req.json();
        
        const updatedIndividual = await Individual.findByIdAndUpdate(
            id,
            {
                ...updateData,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!updatedIndividual) {
            return new Response(
                JSON.stringify({ message: 'Individual not found' }),
                { status: 404 }
            );
        }
        
        return new Response(
            JSON.stringify(updatedIndividual),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating individual:', error);
        return new Response(
            JSON.stringify({ message: 'Failed to update individual', error: error.message }),
            { status: 500 }
        );
    }
}

// Delete individual
export async function DELETE(req, { params }) {
    try {
        await connectToDatabase();
        
        const { id } = await params;
        
        const deletedIndividual = await Individual.findByIdAndDelete(id);
        
        if (!deletedIndividual) {
            return new Response(
                JSON.stringify({ message: 'Individual not found' }),
                { status: 404 }
            );
        }
        
        return new Response(
            JSON.stringify({ message: 'Individual deleted successfully', deletedIndividual }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error deleting individual:', error);
        return new Response(
            JSON.stringify({ message: 'Failed to delete individual', error: error.message }),
            { status: 500 }
        );
    }
}
