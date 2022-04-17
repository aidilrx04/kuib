const dev = process.env.NODE_ENV !== "production";

const server = dev ? "http://localhost:3000" : "yoursitehere.com";

export default server;