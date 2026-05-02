import {
    getUserById,
    updateUser,
    deleteUser,
} from "../../../data/repos/usersRepo.js";

export async function GET(req, { params }) {
    try {
        const user = await getUserById(params.id);

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json(user);
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

export async function PATCH(req, { params }) {
    try {
        const body = await req.json();

        const user = await updateUser(params.id, body);

        return Response.json(user);
    } catch (error) {
        return Response.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        await deleteUser(params.id);

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}