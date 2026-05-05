# Next.js Project Setup with Bun

This is a [Next.js](https://nextjs.org) project bootstrapped using [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).  
This guide will help you set up the project using [Bun](https://bun.sh), a fast JavaScript runtime and package manager.

---

## Prerequisites

- [Bun](https://bun.com/docs/installation) installed on your system
- A terminal (e.g., bash, zsh, or fish)
- Basic familiarity with shell commands

---

## 1. Install Bun

Follow the [official Bun installation guide](https://bun.com/docs/installation) or run the following command:

`curl -fsSL https://bun.com/install | bash`

> Note: If Bun is installed but your terminal returns `command not found`, you may need to add Bun to your `PATH` manually.

---

## 2. Add Bun to Your PATH

1. Check which shell you are using:


`echo $SHELL`

Output examples: `/bin/zsh`, `/bin/bash`, `/bin/fish`

2. Open your shell configuration file:

| Shell | Configuration File |
|-------|------------------|
| bash  | `~/.bashrc `        |
| zsh   | `~/.zshrc`          |
| fish  | `~/.config/fish/config.fish` |

3. Add the following lines to your shell configuration file:


`export BUN_INSTALL="$HOME/.bun"`

`export PATH="$BUN_INSTALL/bin:$PATH"`


4. Reload your shell configuration:

For bash
`source ~/.bashrc`

For zsh
`source ~/.zshrc`

For fish
`source ~/.config/fish/config.fish`

Lastly, Restart Vscode if opened during installation.

---

## 3. Clone the Github Repository

`git clone https://github.com/stremespoats951753-lgtm/Web-Development-Project-Group-6`

`cd ~/path/to/repo`

`cd ./Build\ Environment/gamerfeed/`

---

## 4. Install Project Dependencies

Once Bun is installed and properly configured, navigate to your project directory and run:


`bun install`


---

## 5. Initialize Prisma

`bunx prisma generate`

`bunx prisma migrate dev --name init`

`bun ./prisma/seed.mjs`

---

## 6. Run the Development Server

Start the development server with:


`bun run dev`


Open your browser and navigate to:

http://localhost:3000

You should now see your Next.js application running locally.

---

## Extra. API Testing Using Postman

Create an account on https://www.postman.com/

Next to Collections, click on the 3 dots, then click import, choose the `postman.json` file in this repo.

click on `Run all`.

---



## Summary

- Installed Bun and added it to the system PATH
- Installed project dependencies using `bun install`
- Started the development server with `bun run dev`

Your development environment is now fully set up and ready for coding.