import dotenv from "dotenv";
dotenv.config();
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

export async function main() {
    // Read image as base64
    const imagePath = "./contoso_layout_sketch.jpg"; // Update with your image path
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
        body: {
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 1000,
            model: model
        }
    });

    if (isUnexpected(response)) {
        throw response.body.error;
    }

    console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});
