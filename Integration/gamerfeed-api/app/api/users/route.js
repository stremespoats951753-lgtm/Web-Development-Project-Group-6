import { getAllUsers, createUser } from "../../data/repos/usersRepo.js";

export async function GET() {
    try {
        const users = await getAllUsers();
        return Response.json(users);
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.username || !body.email || !body.password) {
            return Response.json(
                { error: "username, email, and password are required" },
                { status: 400 }
            );
        }

        const user = await createUser(body);
        return Response.json(user, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}