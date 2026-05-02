import {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
} from "../../../../data/repos/followsRepo.js";

export async function GET(req, context) {
    try {
        const { id } = await context.params;
        const { searchParams } = new URL(req.url);
        const followerId = searchParams.get("followerId");

        const followers = await getFollowers(id);
        const following = await getFollowing(id);

        let followedByCurrentUser = false;

        if (followerId) {
            followedByCurrentUser = await isFollowing(followerId, id);
        }

        return Response.json({
            userId: Number(id),
            followers,
            following,
            followedByCurrentUser,
        });
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch follow data" },
            { status: 500 }
        );
    }
}

export async function POST(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        if (!body.followerId) {
            return Response.json(
                { error: "followerId is required" },
                { status: 400 }
            );
        }

        await followUser(body.followerId, id);

        return Response.json({
            success: true,
            following: true,
        });
    } catch (error) {
        return Response.json(
            { error: error.message || "Failed to follow user" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        if (!body.followerId) {
            return Response.json(
                { error: "followerId is required" },
                { status: 400 }
            );
        }

        await unfollowUser(body.followerId, id);

        return Response.json({
            success: true,
            following: false,
        });
    } catch (error) {
        return Response.json(
            { error: "Failed to unfollow user" },
            { status: 500 }
        );
    }
}