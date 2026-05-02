import { createUser, getUserByEmail } from "../../../data/repos/usersRepo.js";

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.username || !body.email || !body.password) {
            return Response.json(
                { error: "username, email, and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await getUserByEmail(body.email);

        if (existingUser) {
            return Response.json(
                { error: "Email is already registered" },
                { status: 409 }
            );
        }

        const user = await createUser(body);

        return Response.json(
            {
                success: true,
                user,
            },
            { status: 201 }
        );
    } catch (error) {
        return Response.json(
            { error: "Failed to register user" },
            { status: 500 }
        );
    }
}