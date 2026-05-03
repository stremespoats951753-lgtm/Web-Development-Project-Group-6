import {
    getCommentsByPostId,
    createComment,
} from "../../../../data/repos/commentsRepo.js";

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const comments = await getCommentsByPostId(id);

        return Response.json(comments);
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

export async function POST(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        if (!body.userId || !body.text) {
            return Response.json(
                { error: "userId and text are required" },
                { status: 400 }
            );
        }

        const comment = await createComment(id, body);

        return Response.json(comment, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}