import { getDb } from './index';

export async function getSetting(key: string): Promise<string | null> {
    const db = getDb();
    const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM settings WHERE key = ?`,
        [key]
    );
    return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
    const db = getDb();
    await db.runAsync(
        `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
        [key, value]
    );
}

export async function getOpenAIKey(): Promise<string> {
    return (await getSetting('openai_key')) ?? '';
}

export async function setOpenAIKey(key: string): Promise<void> {
    await setSetting('openai_key', key);
}

export async function getBarType(): Promise<'male' | 'female'> {
    const val = await getSetting('bar_type');
    return val === 'female' ? 'female' : 'male';
}