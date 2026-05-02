import { getUserByEmail } from "../../../data/repos/usersRepo.js";

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.email || !body.password) {
            return Response.json(
                { error: "email and password are required" },
                { status: 400 }
            );
        }

        const user = await getUserByEmail(body.email);

        if (!user || user.password !== body.password) {
            return Response.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        return Response.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        return Response.json(
            { error: "Failed to login" },
            { status: 500 }
        );
    }
}