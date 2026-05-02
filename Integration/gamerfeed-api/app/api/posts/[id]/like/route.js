import {
    likePost,
    unlikePost,
    getPostLikeCount,
    hasUserLikedPost,
} from "../../../../data/repos/likesRepo.js";

export async function GET(req, context) {
    try {
        const { id } = await context.params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const likeCount = await getPostLikeCount(id);

        let liked = false;
        if (userId) {
            liked = await hasUserLikedPost(id, userId);
        }

        return Response.json({
            postId: Number(id),
            likeCount,
            liked,
        });
    } catch (error) {
        return Response.json({ error: "Failed to fetch like status" }, { status: 500 });
    }
}

export async function POST(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        if (!body.userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        const alreadyLiked = await hasUserLikedPost(id, body.userId);

        if (alreadyLiked) {
            await unlikePost(id, body.userId);
        } else {
            await likePost(id, body.userId);
        }

        const likeCount = await getPostLikeCount(id);

        return Response.json({
            success: true,
            liked: !alreadyLiked,
            likeCount,
        });
    } catch (error) {
        return Response.json({ error: "Failed to toggle like" }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        if (!body.userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        await unlikePost(id, body.userId);
        const likeCount = await getPostLikeCount(id);

        return Response.json({
            success: true,
            liked: false,
            likeCount,
        });
    } catch (error) {
        return Response.json({ error: "Failed to unlike post" }, { status: 500 });
    }
}