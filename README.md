# Discord.js v14 Bot Framework

A robust and scalable framework for creating Discord bots using **TypeScript**. This framework leverages the power of [Discord.js](https://discord.js.org/) v14 to provide a structured and efficient way to build bots with modern JavaScript/TypeScript features.

---

## Features

- **TypeScript Support**: Write clean and type-safe code with TypeScript.
- **Modular Structure**: Easily organize commands, events, and other bot logic.
- **Hot Reloading**: Automatically reload your bot during development with `tsc-watch`.
- **Prettier Integration**: Maintain consistent code formatting.
- **Environment Configuration**: Use `.env` files to manage sensitive data like tokens and API keys.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js) or [bun](https://bun.sh/) (optional)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ramos350/Bot-Framework.git
cd Bot-Framework
```

### 2. Install Dependencies

```bash
npm install
```

Or, if you're using `bun`:

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DISCORD_TOKEN=your-bot-token
```

Replace `your-bot-token` with your actual Discord bot credentials.

### 4. Configure Config Variables

Head to `config.ts` file in the `src` directory and change the following:

```ts
export const owners = ['your-id'];
export const clientId = 'your-bot-id';
export const prefix = 'your-bot-prefix';
export const loadersConfig = {
    messageCommandLoader: true, // To enable Prefix Command Loader
    interactionCommandLoader: false, // To Enable Interaction Command Loader
    eventLoader: true // To Enable Listener Loader
};
```

### 4. Build and Run the Bot

#### Development Mode (with Hot Reloading)

```bash
npm run watch
```

#### Production Mode

```bash
npm run build
npm start
```

Or, using `bun`:

```bash
bun run dev
```

---

## Project Structure

```plaintext
.
├── src
│   ├── commands       # Command files
│   ├── events         # Event handlers
│   ├── utils          # Utility functions
│   ├── index.ts       # Entry point
├── dist               # Compiled JavaScript files
├── .env               # Environment variables
├── package.json       # Project metadata and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project documentation
```

---

## Scripts

The following scripts are available in the `package.json`:

- `npm start`: Run the bot in production mode.
- `npm run build`: Compile TypeScript files to JavaScript.
- `npm run watch`: Start the bot in development mode with hot reloading.
- `npm run format`: Format the codebase using Prettier.

---

## Contribution

Contributions are welcome! If you find any issues or have suggestions for improvement, feel free to:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a [pull request](https://github.com/ramos350/Bot-Framework/pulls).

---

## Troubleshooting

### Common Issues

1. **Bot Not Responding**:
   - Ensure the bot token in the `.env` file is correct.
   - Verify that the bot is added to the server with the correct permissions.

2. **TypeScript Errors**:
   - Run `npm run build` to check for compilation errors.
   - Ensure your TypeScript version matches the one in `devDependencies`.

3. **Dependencies Not Found**:
   - Run `npm install` to install missing dependencies.

---

## License

This project is licensed under the [ISC License](LICENSE).

---

## Acknowledgments

- [Discord.js](https://discord.js.org/) for the amazing library.
- [TypeScript](https://www.typescriptlang.org/) for making JavaScript development better.
- The open-source community for inspiration and contributions.