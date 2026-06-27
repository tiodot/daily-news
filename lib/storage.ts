// lib/storage.ts
import fs from 'fs/promises';
import path from 'path';
import type { DailyDigest } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

function getFilePath(date: string): string {
  return path.join(DATA_DIR, `${date}.json`);
}

export async function saveDigest(digest: DailyDigest): Promise<void> {
  await ensureDataDir();
  const filePath = getFilePath(digest.date);
  await fs.writeFile(filePath, JSON.stringify(digest, null, 2), 'utf-8');
}

export async function loadDigest(date: string): Promise<DailyDigest | null> {
  try {
    const filePath = getFilePath(date);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getLatestDigest(): Promise<DailyDigest | null> {
  await ensureDataDir();
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse();

    if (jsonFiles.length === 0) return null;

    const latestFile = jsonFiles[0];
    const data = await fs.readFile(path.join(DATA_DIR, latestFile), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function listAvailableDates(): Promise<string[]> {
  await ensureDataDir();
  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
