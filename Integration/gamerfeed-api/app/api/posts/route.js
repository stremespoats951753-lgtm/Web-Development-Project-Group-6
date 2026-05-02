import {
    getAllPosts,
    createPost,
    getFeedPostsForUser,
} from "../../data/repos/postsRepo.js";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const type = searchParams.get("type") || "all";
        const userId = searchParams.get("userId");
        const feedUserId = searchParams.get("feedUserId");

        if (feedUserId) {
            const posts = await getFeedPostsForUser(feedUserId, type);
            return Response.json(posts);
        }

        const posts = await getAllPosts({
            type,
            userId,
        });

        return Response.json(posts);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const newPost = await createPost(body);

        return Response.json(newPost, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to create post" }, { status: 500 });
    }
}