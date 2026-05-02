import {
    likePost,
    unlikePost,
    getPostLikeCount,
    hasUserLikedPost,
} from "../../../../data/repos/likesRepo.js";

export async function GET(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const likeCount = await getPostLikeCount(params.id);

        let liked = false;
        if (userId) {
            liked = await hasUserLikedPost(params.id, userId);
        }

        return Response.json({
            postId: Number(params.id),
            likeCount,
            liked,
        });
    } catch (error) {
        return Response.json({ error: "Failed to fetch like status" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const body = await req.json();

        if (!body.userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        await likePost(params.id, body.userId);
        const likeCount = await getPostLikeCount(params.id);

        return Response.json({
            success: true,
            liked: true,
            likeCount,
        });
    } catch (error) {
        return Response.json({ error: "Failed to like post" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const body = await req.json();

        if (!body.userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        await unlikePost(params.id, body.userId);
        const likeCount = await getPostLikeCount(params.id);

        return Response.json({
            success: true,
            liked: false,
            likeCount,
        });
    } catch (error) {
        return Response.json({ error: "Failed to unlike post" }, { status: 500 });
    }
}