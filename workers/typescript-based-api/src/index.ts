import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { events } from 'fetch-event-stream';


type Bindings = {
	[key in keyof CloudflareBindings]: CloudflareBindings[key];
};


const app = new Hono<{ Bindings: Bindings }>();

const messages = [
	{
		role: "system", content: `You are a visual novel video game. You are going to present the player with a short scenario,
				and ask them to choose between two options, each of which will lead to a different outcome. Label out option A, and the other
				B, so that the user can type in one of the two letters, and then you will generate a response appropriate for the action
				they chose. If the last user message is a letter, A or B, then you should generate a response based on that choice.
			`},
]

app.post("/api/visualNovelText", async (c) => {
	const payload = await c.req.json() || null;
	messages.push({ role: "user", content: payload?.word || '' });
	const eventStream = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		messages: messages,
		max_length: 25
	});
	messages.push({ role: "user", content: eventStream?.response || '' });
	return c.text(eventStream?.response || '');
})

app.post("/api/visualNovelImage", async (c) => {
	const payload = await c.req.json() || null;
	// console.log('eventStream: ', eventStream.response);
	const imageStream = await c.env.AI.run("@cf/bytedance/stable-diffusion-xl-lightning", {
		prompt: payload?.text || ""
	});
	console.log('image stream: ', imageStream);
	return c.body(imageStream, 200, { "content-type": "image/png" });
});

// app.post("/api/", async (c) => {
// 	const payload = await c.req.json();
// 	const eventStream = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
// 		messages: [
// 			{
// 				role: "system", content: `You are a visual novel video game. You are going to present the player with a short scenario,
// 				and ask them to choose between two options, each of which will lead to a different outcome. Label out option A, and the other
// 				B, so that the user can type in one of the two letters, and then you will generate a response appropriate for the action
// 				they chose.
// 			`},
// 			{ role: "user", content: payload.word }
// 		],
// 		stream: true
// 	});
// 	return streamText(c, async (stream) => {
// 		const chunks = events(new Response(eventStream));
// 		for await (const chunk of chunks) {
// 			if (chunk.data !== undefined && chunk.data !== '[DONE]') {
// 				const data = JSON.parse(chunk.data);
// 				stream.write(data.response);
// 			}
// 		}
// 	})
// });

export default app;
