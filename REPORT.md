# GamerFeed — Social Media Platform

**Course Name:** Web Development Fundamentals (CMPS 350)

**Group Members:**
- [Member 1 Name]
- [Member 2 Name]
- [Member 3 Name]

---

## Project Overview

GamerFeed is a front-end social media platform built for gamers using only **HTML5**, **CSS3** (Flexbox/Grid), and **Vanilla JavaScript (ES6+)**. All data — including user accounts, posts, likes, comments, and follow relationships — is stored in the browser's `localStorage` as JSON. There is no backend server; the entire application runs client-side.

---

## Current State of the Project

The project already follows the required stack in a good way overall. It uses semantic HTML in many places, CSS with Flexbox/Grid for layout and responsiveness, and Vanilla JavaScript for interactivity and local data handling through `localStorage`. The general structure is solid and most of the core front-end requirements are present.

## Weak Points

There are still a few weak points in the current front-end:

- Some buttons are shown as interactive, but they do not actually do anything yet. This makes parts of the interface feel unfinished.
- The search bars are present in the UI, but there is no real search logic connected to them.
- Some styling is still being controlled directly from JavaScript instead of being handled fully through CSS classes.
- A few parts of the HTML could be more semantic, especially where generic `div` elements are being used for content that could be better represented with elements like `section`, `aside`, or heading elements.
- Some interactions are implemented in a simple way that works, but could be cleaner and more scalable if the project grows.

## Not Yet Implemented Features

The main features that still feel incomplete or not fully implemented are:

- Search functionality
- Working actions for some sidebar and modal buttons such as saved posts, browse games, share, and similar UI items
- A more complete achievements/discussion/trending system
- More advanced post management beyond the current local front-end behavior
- Full comment interaction depth and richer social features

## Limitations of the Current Front-End Only Version

Since the project is currently front-end only, there are some natural limitations:

- All data is stored locally in the browser, so it is not shared between users or devices
- User accounts are not truly authenticated
- Posts, follows, and comments are not persistent beyond the local browser storage
- There is no real server-side validation or protection
- The application simulates a social platform, but it is not yet a real multi-user system

## What Could Be Done With a Backend

Once a backend is connected, the project could be improved in a much more realistic way:

- Real user registration and login with secure authentication
- Storing users, posts, comments, and follow relationships in a database
- Real-time or shared news feed content between users
- Proper search functionality across posts and users
- Saving posts, notifications, and messaging features
- Better validation, security, and error handling
- Profile data, images, and content syncing across devices
- A more realistic social media experience instead of browser-only simulation

## Overall

The current project works well as a front-end academic project and already meets most of the required technology choices. The main gaps are not in the basic structure, but in incomplete interactive features and the limitations that come from not having a backend yet.

---

## Features Checklist

| Feature                                | Status          | Notes                                                                                                                                          |
| -------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| User Registration                      | Implemented     | With validation (username, email, password, confirm password)                                                                                  |
| User Login                             | Implemented     | Credentials checked against localStorage                                                                                                       |
| User Logout                            | Implemented     | Clears session and redirects to login                                                                                                          |
| User Profile Page                      | Implemented     | Shows avatar, bio, stats, and user's posts                                                                                                     |
| Edit Profile (Username & Bio)          | Implemented     | Updates propagate to all user's posts                                                                                                          |
| News Feed                              | Implemented     | Shows posts from followed users (or all if following nobody)                                                                                   |
| Create New Post                        | Implemented     | With title, content, and type selection                                                                                                        |
| Delete Own Post                        | Implemented     | Only the author can delete                                                                                                                     |
| View Single Post (Modal)               | Implemented     | Full content + comments in a modal overlay                                                                                                     |
| Like / Unlike Posts                    | Implemented     | Like count updates and persists                                                                                                                |
| Comment on Posts                       | Implemented     | Comments saved and displayed in modal                                                                                                          |
| Follow / Unfollow Users                | Implemented     | Users cannot follow themselves; feed reflects follows                                                                                          |
| Light / Dark Theme Toggle              | Implemented     | Persists in localStorage across reloads                                                                                                        |
| Responsive Design                      | Implemented     | Desktop, tablet, and mobile via CSS Flexbox/Grid                                                                                               |
| Semantic HTML5                         | Implemented     | Uses header, main, nav, aside, section, article                                                                                                |
| CSS Flexbox & Grid Layouts             | Implemented     | No CSS frameworks used                                                                                                                         |
| localStorage with JSON                 | Implemented     | All data structured as JSON                                                                                                                    |
| SVG Icons                              | Implemented     | Heart, comment, share, delete, theme toggle icons                                                                                              |
| Centralised Config File                | Implemented     | config.js holds all constants and defaults                                                                                                     |
| Search Functionality                   | Not Implemented | This feature was not completed due to time constraints                                                                                         |
| Saved Posts                            | Not Implemented | This feature was planned but not completed within the project timeframe                                                                        |
| Browse Games                           | Not Implemented | Implementing this properly would likely require backend support and integration with the Steam API, which was beyond the current project scope |
| Share Button                           | Not Implemented | A complete sharing feature would require additional logic and possibly integration with external services                                      |
| Achievements / Discussion / Trending   | Not Implemented | These features would require more advanced data handling and backend support, which were not included in the current version of the project    |
| Choosing a Random Background           | Not Implemented | Problems with scaling SVG Pictures as backgrounds, thus this feature was not completed due to time                                             |
| Adding a right sidebar in profile page | Not Implemented | This feature was planned but not completed within the project                                                                                  |
| Fully Documented using JSDoc           | Not Implemented | Due to time constraints, JSDoc was only partially implemented, with many functions and parameters left undocumented                            |
| Interacting with comments              | Not Implemented | This feature was not completed due to time constraints                                                                                         |
---
## How to Use the Application

### 1. Register a New User
1. Open `HTML/register.html` in your browser (or click "CREATE ACCOUNT" from the login page).
2. Enter a username (min 3 chars), email, password (min 6 chars), and confirm password.
3. Click **REGISTER**. You will be redirected to the login page.

### 2. Log In
1. On `HTML/auth.html`, enter the email and password you just registered with.
2. Click **LOGIN**. You will be taken to the News Feed.

### 3. Edit Your Profile
1. On the feed page, click **My Profile** in the left sidebar.
2. Click **Edit Profile**.
3. Change your username or bio, then click **Save Changes**.

### 4. Create a Post
1. On the feed page, use the create-post form at the top.
2. Enter a title, select a type (Update / Achievement / Discussion), write content.
3. Click **POST IT**. Your post appears at the top of the feed.

### 5. Delete a Post
1. On any post you created, click the **Delete** button (trash icon) in the card footer.
2. The post is removed immediately.

### 6. View a Single Post in Detail
1. Click on any post card or click **READ MORE →**.
2. A modal opens showing the full content and all comments.

### 7. Like a Post
1. Click the **heart icon** on any post card, or inside the modal.
2. The like count increments. Click again to unlike.

### 8. Comment on a Post
1. Open a post in the modal (click the card or READ MORE).
2. Type your comment in the text area and click **POST**.

### 9. Follow / Unfollow a User
1. Click on a post author's username to visit their profile.
2. Click **Follow** to follow them (their posts will appear in your feed).
3. Click **Unfollow** to stop following them.
4. Note: You cannot follow yourself — the button is hidden on your own profile.

### 10. Switch Theme
1. Click the **sun/moon icon** (in the header on feed/profile pages, or bottom-right on login/register pages).
2. The theme switches between dark and light mode.
3. Your preference is saved and persists after page reload.

---

## Notes on Design Choices

### Feed Visibility Logic

It was stated in the project description that:
`The main page of the platform, displaying a stream of posts from the users they follow. Each post should show the author's username, the content of the post, and the timestamp.`
To make the platform more practical, the default news feed displays all posts instead of only followed users. This was a deliberate design choice, since a new user who has just created an account would not be following anyone yet, which would otherwise leave the feed empty. To still support the required follow-based behavior, a separate Followed feed option was included, which filters the posts and shows only content from users the current user follows.

---

## Project Links

- **GitHub Repository URI:** [INSERT YOUR GITHUB REPO URL HERE]
- **Live Demo URI:** [INSERT YOUR LIVE DEMO URL HERE, e.g. GitHub Pages]
