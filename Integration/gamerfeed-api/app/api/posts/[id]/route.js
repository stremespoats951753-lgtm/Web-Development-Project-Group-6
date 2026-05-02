import {
    getPostById,
    updatePost,
    deletePost,
} from "../../../data/repos/postsRepo.js";

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const post = await getPostById(id);

        if (!post) {
            return Response.json({ error: "Post not found" }, { status: 404 });
        }

        return Response.json(post);
    } catch (error) {
        return Response.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const updated = await updatePost(id, body);

        return Response.json(updated);
    } catch (error) {
        return Response.json({ error: "Failed to update post" }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;

        await deletePost(id);

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Failed to delete post" }, { status: 500 });
    }
}