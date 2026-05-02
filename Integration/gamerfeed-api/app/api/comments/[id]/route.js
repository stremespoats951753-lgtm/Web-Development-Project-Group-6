import { deleteComment } from "../../../data/repos/commentsRepo.js";

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;

        await deleteComment(id);

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: "Failed to delete comment" },
            { status: 500 }
        );
    }
}