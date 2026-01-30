import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LinkUp API",
      version: "1.0.0",
      description:
        "Backend API documentation for LinkUp social media app",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],

    // ✅ GLOBAL TAG DEFINITIONS (CORRECT PLACE)
    tags: [
      { name: "Auth", description: "Authentication APIs" },
      {
        name: "Users",
        description:
          "User profile operations, search, and account updates",
      },
      { name: "Posts", description: "Post and feed APIs" },
      { name: "Stories", description: "Temporary user stories" },
      { name: "Messages", description: "Chat APIs" },
      {
        name: "Notifications",
        description: "Notification APIs",
      },
      { name: "Highlights", description: "Highlight APIs" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/**/*.js"], // scan route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
