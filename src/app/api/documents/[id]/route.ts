import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Check if document belongs to user
    const docResult = await query(
      'SELECT id, file_path FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, user.id]
    );

    if (docResult.rowCount === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from database
    await query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [
      documentId,
      user.id,
    ]);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
