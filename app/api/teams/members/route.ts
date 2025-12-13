/**
 * Team Management API
 * Create teams, manage members, configure settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { incrementUsageServer } from '@/lib/firebase-server';
import { Guardian } from '@/lib/guardian-bot';
import { captureError } from '@/lib/sentry';
import {
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  updateTeamMemberRole,
  getUserSubscription,
  getTierDetails,
} from '@/lib/subscription-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/teams/members/add
 * Add team member
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check subscription tier
    const subscription = await getUserSubscription(user.uid);
    const tier = getTierDetails(subscription?.tier || 'free');

    const members = await getTeamMembers(user.uid);
    const activeMembers = members.filter(m => m.isActive).length;

    if (activeMembers >= tier.users) {
      return NextResponse.json(
        { error: `Your plan only allows ${tier.users} team members` },
        { status: 403 }
      );
    }

    // Security check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const guardian = Guardian.getInstance();
    await guardian.analyzeUserBehavior(user.uid, 'team_member_add', { ip, email });

    // Add member
    const member = await addTeamMember(user.uid, email, role);

    // TODO: Send invitation email
    console.log(`Invitation sent to ${email} for team ${user.uid}`);

    // Track usage
    await incrementUsageServer(user.uid, 'teamMemberAdd');

    return NextResponse.json(
      {
        success: true,
        member: {
          id: member.id,
          email: member.email,
          role: member.role,
          joinedAt: member.joinedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    captureError(error, { context: 'api/teams/members/add' });
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teams/members
 * List team members
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await getTeamMembers(user.uid);

    return NextResponse.json({
      success: true,
      members: members
        .filter(m => m.isActive)
        .map(m => ({
          id: m.id,
          email: m.email,
          name: m.name,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
          lastActive: m.lastActive?.toISOString(),
        })),
    });
  } catch (error) {
    captureError(error, { context: 'api/teams/members' });
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teams/members/[id]
 * Remove team member
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Verify member ownership
    const members = await getTeamMembers(user.uid);
    const member = members.find(m => m.id === memberId);

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Security check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const guardian = Guardian.getInstance();
    await guardian.analyzeUserBehavior(user.uid, 'team_member_remove', {
      ip,
      memberId,
      email: member.email,
    });

    // Remove member
    await removeTeamMember(user.uid, memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { context: 'api/teams/members/delete' });
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teams/members/[id]/role
 * Update team member role
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');
    const body = await request.json();
    const { role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: 'Member ID and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Verify member ownership
    const members = await getTeamMembers(user.uid);
    const member = members.find(m => m.id === memberId);

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Security check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const guardian = Guardian.getInstance();
    await guardian.analyzeUserBehavior(user.uid, 'team_role_update', {
      ip,
      memberId,
      newRole: role,
    });

    // Update role
    await updateTeamMemberRole(user.uid, memberId, role);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { context: 'api/teams/members/role' });
    return NextResponse.json(
      { error: 'Failed to update team member role' },
      { status: 500 }
    );
  }
}

