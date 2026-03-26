
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let settings = await prisma.globalSettings.findFirst();

        if (!settings) {
            settings = await prisma.globalSettings.create({
                data: { defaultDomain: 'fieldtrack.com' }
            });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { defaultDomain } = await request.json();

        if (!defaultDomain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // Upsert settings (only 1 row should exist)
        const firstSetting = await prisma.globalSettings.findFirst();

        // Remove https:// if present (backend safety, though frontend handles it too)
        let cleanDomain = defaultDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
        // Ensure it starts with @ if it's an email domain suffix? No, user said placeholder @company.com
        // But the field is "defaultDomain", typically "fieldtrack.com".
        // Use placeholder structure, but store as domain.
        // User says: "Forced Email Domain" and placeholder "@company.com".
        // If user enters "@company.com", we probably want "company.com" or keep the @?
        // Schema says `defaultDomain String @default("fieldtrack.com")`.
        // I will just save what they give, maybe strip @ if needed?
        // Let's assume user enters "company.com" or "@company.com".
        // I'll strip @ for storage if that's the convention, or keep it.
        // Let's just strip https:// as requested.

        const settings = await prisma.globalSettings.upsert({
            where: { id: firstSetting?.id || 'new' }, // 'new' won't match, so it creates if empty
            update: { defaultDomain: cleanDomain },
            create: { defaultDomain: cleanDomain }
        });

        return NextResponse.json({ settings });

    } catch (error: any) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
