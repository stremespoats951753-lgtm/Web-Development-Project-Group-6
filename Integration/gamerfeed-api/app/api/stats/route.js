import { getPlatformStats } from "../../data/repos/statsRepo.js";

export async function GET() {
    try {
        const stats = await getPlatformStats();

        return Response.json(stats);
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch platform stats" },
            { status: 500 }
        );
    }
}