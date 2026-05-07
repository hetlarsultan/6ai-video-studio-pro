import { eq, and } from 'drizzle-orm';
import { getDb } from './db';
import { userProjects, users } from '../drizzle/schema';
import { nanoid } from 'nanoid';

export interface ProjectShare {
  id: number;
  projectId: number;
  sharedWithUserId: number;
  sharedByUserId: number;
  permission: 'view' | 'edit' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export async function shareProject(
  projectId: number,
  sharedByUserId: number,
  sharedWithUserId: number,
  permission: 'view' | 'edit' | 'admin' = 'view'
): Promise<ProjectShare> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check if project exists and user is owner
  const project = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.id, projectId), eq(userProjects.userId, sharedByUserId)))
    .limit(1);

  if (project.length === 0) {
    throw new Error('Project not found or you do not have permission to share it');
  }

  // For now, we'll store shares in a simple way
  // In a production app, you'd want a separate projectShares table
  const existingShare = null;

  // For now, return a mock share object
  // In production, implement with a proper projectShares table
  return {
    id: Math.floor(Math.random() * 10000),
    projectId,
    sharedWithUserId,
    sharedByUserId,
    permission,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function unshareProject(
  projectId: number,
  sharedByUserId: number,
  sharedWithUserId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verify ownership
  const project = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.id, projectId), eq(userProjects.userId, sharedByUserId)))
    .limit(1);

  if (project.length === 0) {
    throw new Error('Project not found or you do not have permission');
  }

  // For now, just return true (no actual deletion in mock)
  return true;
}

export async function getSharedProjects(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // For now, return empty array (no actual shares in mock)
  const sharedProjects: any[] = [];

  return sharedProjects;
}

export async function getProjectShares(projectId: number, userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verify ownership
  const project = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.id, projectId), eq(userProjects.userId, userId)))
    .limit(1);

  if (project.length === 0) {
    throw new Error('Project not found or you do not have permission');
  }

  // For now, return empty array (no actual shares in mock)
  const shares: any[] = [];

  return shares;
}

export async function updateSharePermission(
  projectId: number,
  sharedByUserId: number,
  sharedWithUserId: number,
  permission: 'view' | 'edit' | 'admin'
): Promise<ProjectShare> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verify ownership
  const project = await db
    .select()
    .from(userProjects)
    .where(and(eq(userProjects.id, projectId), eq(userProjects.userId, sharedByUserId)))
    .limit(1);

  if (project.length === 0) {
    throw new Error('Project not found or you do not have permission');
  }

  // For now, return mock updated share
  return {
    id: Math.floor(Math.random() * 10000),
    projectId,
    sharedWithUserId,
    sharedByUserId,
    permission,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
