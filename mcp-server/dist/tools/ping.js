import * as z from "zod";
export async function ping() {
    return {
        content: [{ type: "text", text: "pong" }],
        structuredContent: { status: "pong" },
    };
}
//# sourceMappingURL=ping.js.map